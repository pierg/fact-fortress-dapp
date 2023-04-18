use dep::std;

mod data;


fn main(
    // public : pub data::Public,
    private : pub data::Private,
    ) -> pub [u8; 3]{

    // Compute hash
    // let mut digest256 = std::sha256::digest(private.data.d1);

    constrain private.data.d1[1] < 39;

    private.data.d1
    
    // // Check data has not been compromised
    // // constrain digest256 == private.provenance.hash;

    // // Proof of provenance
    // let provenance_check = std::schnorr::verify_signature(
    //     public.keys.x, 
    //     public.keys.y, 
    //     private.provenance.signature, 
    //     digest256);

    // // Fake provenance, since Noir has open issue
    // constrain provenance_check == 0;
}
