use dep::std;

fn main(pub_key_x: pub Field, pub_key_y: pub Field, signature: pub [u8; 64], hash: [u8; 32]) {
    let result = std::schnorr::verify_signature(pub_key_x, pub_key_y, signature, hash);
    constrain result == 1;
}
