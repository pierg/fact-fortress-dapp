use dep::std;

fn main(pub_key_x: pub Field, pub_key_y: pub Field, signature: [u8; 64], message: [u8; 10]) {
    let result = std::schnorr::verify_signature(pub_key_x, pub_key_y, signature, message);
    constrain result == 1;
}
