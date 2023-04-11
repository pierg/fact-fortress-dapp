use dep::std;

fn main(message: [u8; 10], pub_key_x: pub Field, pub_key_y: pub Field, signature: [u8; 64]) {
    let result = std::schnorr::verify_signature(pub_key_x,pub_key_y,signature, message);
    constrain result == 1;
}
