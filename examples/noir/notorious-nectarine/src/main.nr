use dep::std;

fn main(
    governor: Field,
    proposal_id: Field,
    // todo: no variable length arrays, so we're stuck passing fixed length votes arrays
    votes: [u64; 2],
    _public_key_xs: [u8; 64],
    _public_key_ys: [u8; 64],
    _accountProofs: [u8; 1024],
    _storageProofs: [u8; 1024],
) -> pub [Field; 2] {
    let mut lastId: u64 = 0;

    let _signed = std::hash::pedersen([governor, proposal_id]);

    for i in 0..2 {
        // votes must be in order so we cannot have duplicates
        constrain lastId < votes[i];
        lastId = votes[i];

        // todo: verify the signature over the vote id
        // constrain std::ecdsa_secp256k1::verify_signature(public_key_xs[i], public_key_ys[i], signature[i], signed) == 1;

        // todo: verify the merkle proofs proving ownership of the token id
        // constrain std::merkle::check_membership(...);
    };


    [governor, proposal_id]
}
