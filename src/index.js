const { initCircuitsHelpers } = require("./frontend_helpers/proof.js");
const { contractsHelper } = require("./contracts/contracts.js");

const { healthController } = require("./controllers/health.controller.js");
const {
    authorizeAuthorityController,
    authorizeResearcherController,
    getAuthorityTokenIdController,
    getResearcherTokenIdController,
    getAllAccessTypesController,
    getOwnAccessTypesController
} = require("./controllers/nft.controller.js");
const {
    getPublicKeyController,
    setPublicKeyController
} = require("./controllers/publicKeys.controller.js");
const {
    generateKeyPairController,
    uploadSignatureController,
    signHashController,
    signMessageController
} = require("./controllers/signature.controller.js");
const {
    getAvailableFunctionsController,
} = require("./frontend_helpers/healthFunctions.js");
const {
    generateProofController,
    verifyPublicInputsPoPController,
    verifyProofController
} = require("./controllers/proof.controller.js");

const express = require("express");
const app = express();
app.use(express.json());

// server port
const port = 3000;

app.set("json spaces", 4);
// app.use(express.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

async function deployContracts() {
    console.log('---------- deploying contracts ----------');
    await contractsHelper.add({
        "filename": "zkpHealthAuthorityToken.sol",
        "name": "ZkpHealthAuthorityToken",
    });

    await contractsHelper.add({
        "filename": "zkpHealthResearcherToken.sol",
        "name": "ZkpHealthResearcherToken",
    });

    await contractsHelper.add({
        "filename": "zkpHealthVerifier.sol",
        "name": "ZkpHealthVerifier",
        "is_verifier": true,
        "circuit_name": "schnorr", // i.e., name of the directory that contains the circuit
        "circuit_purpose": "proof_of_provenance", // i.e., health_function
        "abi_generator": function generateAbi(args) {
            // right side: args.{name_of_key_in_request_body}
            const publicKey = args.public_key;
            const hashHex = args.hash;
            const signature = args.signature;

            // public key -> x, y
            const publicKeyXY = Buffer.from(publicKey.replace(/^0x/i, ''), 'hex')
            const publicKey_x = publicKeyXY.subarray(0, 32)
            const publicKey_y = publicKeyXY.subarray(32, 64)

            // hash: hex -> bytes
            let hash = [];
            for (let c = 0; c < hashHex.length; c += 2) {
                hash.push(parseInt(hashHex.substr(c, 2), 16));
            }

            return {
                pub_key_x: '0x' + publicKey_x.toString('hex'),
                pub_key_y: '0x' + publicKey_y.toString('hex'),
                signature,
                hash
            }
        }
    });

    await contractsHelper.add({
        "filename": "zkpHealth.sol",
        "name": "ZkpHealth",
        "args": [
            contractsHelper.getAddress("ZkpHealthAuthorityToken"),
            contractsHelper.getAddress("ZkpHealthResearcherToken"),
            contractsHelper.getAddress("ZkpHealthVerifier"),
        ],
    });

    console.log("► contracts deployed ✓");
}

// frontend helpers -- in Production, should be done offline --
app.get("/health", healthController); // ensure the service is healthy
app.get("/key_pair", generateKeyPairController); // generate private/public key keypair
app.post("/sign_hash", signHashController); // sign a hashed message
app.post("/sign_message", signMessageController); // hash and sign a message
app.post("/generate_proof", generateProofController); // generate the proof
app.get("/available_functions", getAvailableFunctionsController);

// authorizations (NFTs)
app.get("/authorize_authority", authorizeAuthorityController); // authorize an authority (hospital) (mint NFT and send)
app.post("/authorize_researcher", authorizeResearcherController); // authorize a researcher (mint NFT and send)
app.get("/authority_token_id", getAuthorityTokenIdController); // get NFT ID associated with authority address
app.get("/researcher_token_id", getResearcherTokenIdController); // get NFT ID associated with researcher address
app.get("/all_access_types", getAllAccessTypesController); // get all access types
app.get("/own_access_types", getOwnAccessTypesController); // get own access type

// public keys
app.get("/publickey", getPublicKeyController); // get public key
app.put("/publickey", setPublicKeyController); // set public key

// signature
app.post("/upload_signature", uploadSignatureController); // upload the signature on chain

// proofs
app.post("/verify_public_inputs", verifyPublicInputsPoPController); // verify the public inputs (PoP)
app.post("/verify_proof", verifyProofController); // verify the proof

deployContracts().then(() => {
    // init circuits helpers in the background (takes time)
    initCircuitsHelpers().then(async() => {
        const server = app.listen(port, () =>
            console.log(`► server started on port ${port} ✓`)
        );

        process.on("SIGTERM", shutDown);
        process.on("SIGINT", shutDown);

        let connections = [];

        server.on("connection", (connection) => {
            connections.push(connection);
            connection.on(
                "close",
                () => (connections = connections.filter((curr) => curr !== connection))
            );
        });

        function shutDown() {
            console.log("Received kill signal, shutting down gracefully");
            server.close(() => {
                console.log("Closed out remaining connections");
                process.exit(0);
            });

            setTimeout(() => {
                console.error(
                    "Could not close connections in time, forcefully shutting down"
                );
                process.exit(1);
            }, 10000);

            connections.forEach((curr) => curr.end());
            setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
        }
    });
});