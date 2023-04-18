use dep::std;

mod data;


fn main(
    // public : pub data::Public,
    private : pub data::Private,
    ) -> pub [u8; 32]{

    // Compute hash
    // private.data.d1 = [ 6, 38, 3,]
    let mut digest256 = std::sha256::digest(private.data.d1);

    // digest256 =  ['ad', 'd6', 'e4', 'ef', '04', '80', 'd4', 'f5', '08', '99', '52', '71', '8e', '7e', '3f', '8e', '84', 'f5', '30', 'f2', '96', 'e1', '2d', '26', 'fc', '18', 'a6', 'a1', '65', 'b8', 'c0', '3c']

    digest256
    

    // check that the digest256 generated is what was signed by the authority

    // Proof of provenance
    // let provenance_check = std::schnorr::verify_signature(
    //     public.keys.x, 
    //     public.keys.y, 
    //     private.provenance.signature, 
    //     digest256);

    // // Fake provenance, since Noir has open issue
    // constrain provenance_check == 0;
}
