use secp256k1::{Message, PublicKey, Secp256k1, Signature};
use std::fs;
use toml::from_str;

fn main() {
    // Load the TOML file
    let toml_str = fs::read_to_string("signature.toml").unwrap();
    let value = from_str(&toml_str).unwrap();
    let map = value.as_table().unwrap();

    // Parse the values from the TOML file
    let hashed_message = map.get("hashed_message").unwrap().as_array().unwrap().iter().map(|v| v.as_integer().unwrap() as u8).collect::<Vec<_>>();
    let pub_key_x = map.get("pub_key_x").unwrap().as_array().unwrap().iter().map(|v| v.as_integer().unwrap() as u8).collect::<Vec<_>>();
    let pub_key_y = map.get("pub_key_y").unwrap().as_array().unwrap().iter().map(|v| v.as_integer().unwrap() as u8).collect::<Vec<_>>();
    let signature = map.get("signature").unwrap().as_array().unwrap().iter().map(|v| v.as_integer().unwrap() as u8).collect::<Vec<_>>();

    // Create the secp256k1 context and public key
    let secp = Secp256k1::new();
    let public_key = PublicKey::from_slice(&secp, &[&pub_key_x[..], &pub_key_y[..]].concat()[..]).unwrap();

    // Verify the signature
    let message = Message::from_slice(&hashed_message).unwrap();
    let signature = Signature::from_compact(&signature).unwrap();
    let result = secp.verify(&message, &signature, &public_key);

    if result.is_ok() {
        println!("Signature is valid!");
    } else {
        println!("Signature is invalid.");
    }
}
