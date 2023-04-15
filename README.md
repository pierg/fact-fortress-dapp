# ZKP Health

## Endpoints

### Run the API Server

```
pnpm run serve
```

### End-to-End Flow

#### 1 | Generate the public/private keys pair

| WARNING: This action should be performed offline. This endpoint is just an helper. Hospitals are expected to generate the keys themselves. |
| --- |

```
GET http://localhost:3000/key_pair
```

* **Input**
    * (None)
* **Output**
    * `public_key` Public key based on the Grumpkin curve, used by Noir
    * `private_key` Random private key

https://user-images.githubusercontent.com/66550865/232197455-d07dbda7-45aa-470e-86fa-e5cfa62a14a6.mov


*Example*

```
curl --location 'http://localhost:3000/key_pair'
{
    "public_key": "0x0dd7811f6af9d473c41376affb8660aba00e255c49844b31182f54bc0ab3e2ae1b23bd0e9afdb8275f880934b115057ed86f075048d4d8bd9fa8d92670dc6892",
    "private_key": "ca1a2b52a7405f06f71c03cbaada78559aa86a0e2d01321540012f3762a12818"
}
```

#### 2 | Authorize the hospital to upload its public key *(On-Chain)*

```
GET http://localhost:3000/mint
```

* **Caller**
    * Owner of the contract
* **Input**
    * (Header) `from: owner` Only the owner of the contract can mint
    * (Parameter) `recipient` Address of the hospital about to receive the NFT
* **Output**
    * `recipient` Address of the hospital having received the NFT
    * `token_id` NFT token ID

https://user-images.githubusercontent.com/66550865/232197466-fc5ce95b-7f7b-4915-b0f3-3c334716a538.mov


*Example*

```
curl --location 'http://localhost:3000/mint?recipient=0x98526c571e324028250B0f5f247Ca4F1b575fadB' \
--header 'from: owner'
{
    "recipient": "0x98526c571e324028250B0f5f247Ca4F1b575fadB",
    "token_id": "1"
}
```

#### 3 | Upload the public key *(On-Chain)*

```
PUT http://localhost:3000/publickey
```

* **Caller**
    * Hospital
* **Input**
    * (Header) `from: owner` Only the hospital owner of an NFT can upload its public key
    * (Parameter) `token_id` NFT token ID owned by the hospital
    * (Parameter) `name` Name associated with the public key
    * (Parameter) `public_key` Grumpkin-based public key
* **Output**
    * `name` Name associated with the public key
    * `public_key` Grumpkin-based public key
    * `public_key_version` Version of the public key


https://user-images.githubusercontent.com/66550865/232198904-37360afb-5515-46ee-a195-e53f2dfa456e.mov


*Example*

```
curl --location --request PUT 'http://localhost:3000/publickey?token_id=1&name=hospitaA&public_key=0x0dd7811f6af9d473c41376affb8660aba00e255c49844b31182f54bc0ab3e2ae1b23bd0e9afdb8275f880934b115057ed86f075048d4d8bd9fa8d92670dc6892' \
--header 'from: hospitalA'
{
    "name": "hospitaA",
    "public_key": "0x0dd7811f6af9d473c41376affb8660aba00e255c49844b31182f54bc0ab3e2ae1b23bd0e9afdb8275f880934b115057ed86f075048d4d8bd9fa8d92670dc6892",
    "public_key_version": "0"
}
```

#### 4 | Hash and Sign Health Data

| WARNING: This action should be performed offline. This endpoint is just an helper. Hospitals are expected to hash and sign the health data themselves. |
| --- |

```
POST http://localhost:3000/sign
```

* **Input**
    * (Body) `private_key` Private key associated with the public key that will be used for the proof
    * (Body) `message` Health data to hash and sign
* **Output**
    * `hash` SHA-256 hash of the data (hex)
    * `signature` Signature of the hash (bytes)

(video)

*Example*

```
curl --location 'http://localhost:3000/sign' \
--header 'Content-Type: application/json' \
--data '{
	"private_key": "ca1a2b52a7405f06f71c03cbaada78559aa86a0e2d01321540012f3762a12818",
	"message": {
        "patient_id_0": {
            "genetic_data": {
                "rs10757274": "AA",
                "rs562556": "AA",
                "rs429358": "TT",
                "rs7412": "TT",
                "rs1801133": "TT"
            },
            "name": "Charlie"
        },
        "patient_id_1": {
            "genetic_data": {
                "rs10757274": "GG",
                "rs562556": "AG",
                "rs429358": "TT",
                "rs7412": "CT",
                "rs1801133": "TT"
            },
            "name": "Alice"
        }
	}
}'
{
    "hash": "e51b88c9ef2ee7a084f676a4d07313895e2850f6789e1bb1aa9845c3d2dd6dea",
    "signature": [
        30,
        149,
        144,
        . . .
        10,
        179,
        103
    ]
}
```

#### 5 | Generate the Proof

| WARNING: This action should be performed offline. This endpoint is just an helper. Researchers are expected to generate the proofs themselves. |
| --- |

```
POST http://localhost:3000/generate_proof
```

* **Input**
    * (Parameter) `public_key` Grumpkin-based public key
    * (Body) `hash` Health data hash (hex; copied from step 4)
    * (Body) `signature` Signature of the hash (bytes; copied from step 4)
* **Output**
    * Proof (bytes)

(video)

*Example*

```
curl --location 'http://localhost:3000/generate_proof?public_key=0x0dd7811f6af9d473c41376affb8660aba00e255c49844b31182f54bc0ab3e2ae1b23bd0e9afdb8275f880934b115057ed86f075048d4d8bd9fa8d92670dc6892' \
--header 'Content-Type: application/json' \
--data '{
    "hash": "e51b88c9ef2ee7a084f676a4d07313895e2850f6789e1bb1aa9845c3d2dd6dea",
    "signature": [
        30,
        149,
        144,
        . . .
        10,
        179,
        103
    ]
}'
[
    13,
    215,
    129,
    . . .
    71,
    13,
    23
]
```

#### 6 | [ZKP] Verify the Public Inputs *(On-Chain)*

```
POST http://localhost:3000/verify_public_inputs
```

* **Input**
    * (Parameter) `public_key` Grumpkin-based public key
    * (Body) Proof (bytes)
* **Output**
    * `public_input_match`: `true` (public inputs match) or `false` (public inputs do not match)

(video)

*Example*

```
curl --location 'http://localhost:3000/verify_public_inputs?public_key=0x0dd7811f6af9d473c41376affb8660aba00e255c49844b31182f54bc0ab3e2ae1b23bd0e9afdb8275f880934b115057ed86f075048d4d8bd9fa8d92670dc6892' \
--header 'Content-Type: application/json' \
--data '[
    13,
    215,
    129,
    . . .
    71,
    13,
    23
]'
{
    "public_input_match": true
}
```

#### 7 | [ZKP] Verify the Proof of Provenance *(On-Chain)*

```
POST http://localhost:3000/verify_public_inputs
```

* **Input**
    * (Body) Proof (bytes)
* **Output**
    * `valid_proof_of_provenance`: `true` (valid proof) or `false` (invalid proof)

(video)

*Example*

```
curl --location 'http://localhost:3000/verify_proof' \
--header 'Content-Type: application/json' \
--data '[
    13,
    215,
    129,
    . . .
    71,
    13,
    23
]'
{
    "valid_proof_of_provenance": true
}
```
