use secp256k1::{Message, Secp256k1, Signature};
use std::fs;
use toml::{Value, to_string_pretty};

fn main() {
    // Generate a random private key
    let secp = Secp256k1::new();
    let (private_key, public_key) = secp.generate_keypair(&mut rand::thread_rng());

    // Convert the message to bytes and hash it
    let message_str = "Hello, World!";
    let message = Message::from_slice(&message_str.as_bytes().hash()).unwrap();

    // Sign the message
    let signature = secp.sign(&message, &private_key);

    // Serialize the values to a TOML file
    let mut map = Value::new_table();
    map.insert("hashed_message".to_string(), Value::from(signature.message().hash().to_vec()));
    map.insert("pub_key_x".to_string(), Value::from(public_key.serialize()[..32].to_vec()));
    map.insert("pub_key_y".to_string(), Value::from(public_key.serialize()[32..].to_vec()));
    map.insert("signature".to_string(), Value::from(signature.serialize_compact().to_vec()));
    let toml_str = to_string_pretty(&Value::Table(map)).unwrap();
    fs::write("signature.toml", toml_str).unwrap();
}
