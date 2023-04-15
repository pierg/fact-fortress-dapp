# ZKP Health

## Endpoints

### Run the API Server

```
pnpm run serve
```

### End-to-End Flow

#### 1 | Generate the public/private keys pair**

| WARNING: This action should be performed offline. This endpoint is just an helper. Hospitals are expected to generate the keys themselves |
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

#### 2 | Authorize the hospital to upload its public key**

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

#### 3 | Upload the public key**

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
