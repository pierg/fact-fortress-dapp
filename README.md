# ZKP Health

## Endpoints

### Run the API Server

```
pnpm run serve
```

### End-to-End Flow

**1 | Generate the public/private keys pair**

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


https://user-images.githubusercontent.com/66550865/232196169-50dce909-cc9d-437b-8524-1669e3e20ac2.mov

*Example*

```
curl --location 'http://localhost:3000/key_pair'
{
    "public_key": "0x0dd7811f6af9d473c41376affb8660aba00e255c49844b31182f54bc0ab3e2ae1b23bd0e9afdb8275f880934b115057ed86f075048d4d8bd9fa8d92670dc6892",
    "private_key": "ca1a2b52a7405f06f71c03cbaada78559aa86a0e2d01321540012f3762a12818"
}
```

**2 | Authorize the hospital to upload its public key**

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

(video)

*Example*

```
curl --location 'http://localhost:3000/mint?recipient=0x98526c571e324028250B0f5f247Ca4F1b575fadB' \
--header 'from: owner'
{
    "recipient": "0x98526c571e324028250B0f5f247Ca4F1b575fadB",
    "token_id": "1"
}
```

