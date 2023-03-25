%builtins output pedersen range_check ecdsa

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import (
    HashBuiltin,
    SignatureBuiltin,
)
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.signature import (
    verify_ecdsa_signature,
)

from starkware.cairo.common.dict import DictAccess

from starkware.cairo.common.dict import dict_new

from starkware.cairo.common.dict import dict_update
from starkware.cairo.common.math import assert_not_zero


from starkware.cairo.common.dict import dict_squash
from starkware.cairo.common.small_merkle_tree import (
    small_merkle_tree_update,
)



struct RecordInfo {
    // The ID of the recordr.
    authority: felt,
    // The recordr's public key.
    pub_key: felt,
    // The record (0 or 1).
    record: felt,
    // The ECDSA signature (r and s).
    r: felt,
    s: felt,
}


// Returns a list of RecordInfo instances representing the claimed
// records.
// The validity of the returned data is not guaranteed and must
// be verified by the caller.
func get_claimed_records() -> (records: RecordInfo*, n: felt) {
    alloc_locals;
    local n;
    let (records: RecordInfo*) = alloc();
    %{
        ids.n = len(program_input['records'])
        public_keys = [
            int(pub_key, 16)
            for pub_key in program_input['public_keys']]
        for i, record in enumerate(program_input['records']):
            # Get the address of the i-th record.
            base_addr = \
                ids.records.address_ + ids.RecordInfo.SIZE * i
            memory[base_addr + ids.RecordInfo.authority] = \
                record['authority']
            memory[base_addr + ids.RecordInfo.pub_key] = \
                public_keys[record['authority']]
            memory[base_addr + ids.RecordInfo.record] = \
                record['record']
            memory[base_addr + ids.RecordInfo.r] = \
                int(record['r'], 16)
            memory[base_addr + ids.RecordInfo.s] = \
                int(record['s'], 16)
    %}
    return (records=records, n=n);
}


// The identifier that represents what we're voting for.
// This will appear in the user's signature to distinguish
// between different polls.
const POLL_ID = 10018;

func verify_record_signature{
    pedersen_ptr: HashBuiltin*, ecdsa_ptr: SignatureBuiltin*
}(record_info_ptr: RecordInfo*) {
    let (message) = hash2{hash_ptr=pedersen_ptr}(
        x=POLL_ID, y=record_info_ptr.record
    );

    verify_ecdsa_signature(
        message=message,
        public_key=record_info_ptr.pub_key,
        signature_r=record_info_ptr.r,
        signature_s=record_info_ptr.s,
    );
    return ();
}


const LOG_N_VOTERS = 10;



struct VotingState {
    // The number of "Yes" records.
    n_yes_records: felt,
    // The number of "No" records.
    n_no_records: felt,
    // Start and end pointers to a DictAccess array with the
    // changes to the public key Merkle tree.
    public_key_tree_start: DictAccess*,
    public_key_tree_end: DictAccess*,
}

func init_voting_state() -> (state: VotingState) {
    alloc_locals;
    local state: VotingState;
    assert state.n_yes_records = 0;
    assert state.n_no_records = 0;
    %{
        public_keys = [
            int(pub_key, 16)
            for pub_key in program_input['public_keys']]
        initial_dict = dict(enumerate(public_keys))
    %}
    let (dict: DictAccess*) = dict_new();
    assert state.public_key_tree_start = dict;
    assert state.public_key_tree_end = dict;
    return (state=state);
}


func process_record{
    pedersen_ptr: HashBuiltin*,
    ecdsa_ptr: SignatureBuiltin*,
    state: VotingState,
}(record_info_ptr: RecordInfo*) {
    alloc_locals;

    // Verify that pub_key != 0.
    assert_not_zero(record_info_ptr.pub_key);

    // Verify the signature's validity.
    verify_record_signature(record_info_ptr=record_info_ptr);

    // Update the public key dict.
    let public_key_tree_end = state.public_key_tree_end;
    dict_update{dict_ptr=public_key_tree_end}(
        key=record_info_ptr.authority,
        prev_value=record_info_ptr.pub_key,
        new_value=0,
    );

    // Generate the new state.
    local new_state: VotingState;
    assert new_state.public_key_tree_start = (
        state.public_key_tree_start);
    assert new_state.public_key_tree_end = (
        public_key_tree_end);

    // Update the counters.
    tempvar record = record_info_ptr.record;
    if (record == 0) {
        // Record "No".
        assert new_state.n_yes_records = state.n_yes_records;
        assert new_state.n_no_records = state.n_no_records + 1;
    } else {
        // Make sure that in this case record=1.
        assert record = 1;

        // Record "Yes".
        assert new_state.n_yes_records = state.n_yes_records + 1;
        assert new_state.n_no_records = state.n_no_records;
    }

    // Update the state.
    let state = new_state;
    return ();
}

func process_records{
    pedersen_ptr: HashBuiltin*,
    ecdsa_ptr: SignatureBuiltin*,
    state: VotingState,
}(records: RecordInfo*, n_records: felt) {
    if (n_records == 0) {
        return ();
    }

    process_record(record_info_ptr=records);

    process_records(
        records=records + RecordInfo.SIZE, n_records=n_records - 1
    );
    return ();
}

struct BatchOutput {
    n_yes_records: felt,
    n_no_records: felt,
    public_keys_root_before: felt,
    public_keys_root_after: felt,
}



func main{
    output_ptr: felt*,
    pedersen_ptr: HashBuiltin*,
    range_check_ptr,
    ecdsa_ptr: SignatureBuiltin*,
}() {
    alloc_locals;

    let output = cast(output_ptr, BatchOutput*);
    let output_ptr = output_ptr + BatchOutput.SIZE;

    let (records, n_records) = get_claimed_records();
    let (state) = init_voting_state();
    process_records{state=state}(records=records, n_records=n_records);
    local pedersen_ptr: HashBuiltin* = pedersen_ptr;
    local ecdsa_ptr: SignatureBuiltin* = ecdsa_ptr;

    // Write the "yes" and "no" counts to the output.
    assert output.n_yes_records = state.n_yes_records;
    assert output.n_no_records = state.n_no_records;

    // Squash the dict.
    let (squashed_dict_start, squashed_dict_end) = dict_squash(
        dict_accesses_start=state.public_key_tree_start,
        dict_accesses_end=state.public_key_tree_end,
    );
    local range_check_ptr = range_check_ptr;

    // Compute the two Merkle roots.
    let (root_before, root_after) = small_merkle_tree_update{
        hash_ptr=pedersen_ptr
    }(
        squashed_dict_start=squashed_dict_start,
        squashed_dict_end=squashed_dict_end,
        height=LOG_N_VOTERS,
    );

    // Write the Merkle roots to the output.
    assert output.public_keys_root_before = root_before;
    assert output.public_keys_root_after = root_after;

    return ();
}





