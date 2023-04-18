const { initHelpers } = require("./frontend_helpers/proof.js");
const { contracts } = require("./contracts/contracts.js");

const { healthController } = require("./controllers/health.controller.js");
const {
    mintController,
    getTokenIdController
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
    generateProofFunctionController
} = require("./controllers/todo.controller.js");
const {
    generateProofController,
    verifyPublicInputsPoPController,
    verifyProofPoPController
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
    next();
});

async function deploy() {
    await contracts.add({
        "filename": "zkpHealthToken.sol",
        "name": "ZkpHealthToken",
    });

    await contracts.add({
        "filename": "zkpHealthVerifier.sol",
        "name": "ZkpHealthVerifier",
        "purpose": "proof_of_provenance",
    });

    await contracts.add({
        "filename": "zkpHealth.sol",
        "name": "ZkpHealth",
        "args": [
            contracts.getAddress("ZkpHealthToken"),
            contracts.getAddress("ZkpHealthVerifier"),
        ],
    });
}

// frontend helpers -- in Production, should be done offline --
app.get("/health", healthController); // ensure the service is healthy
app.get("/key_pair", generateKeyPairController); // generate private/public key keypair
app.post("/sign_hash", signHashController); // sign a hashed message
app.post("/sign_message", signMessageController); // hash and sign a message
app.post("/generate_proof", generateProofController); // generate the proof

// public keys
app.get("/mint", mintController); // authorize an entity (mint NFT and send)
app.get("/tokenid", getTokenIdController); // get NFT ID associated with address
app.get("/publickey", getPublicKeyController); // get public key
app.put("/publickey", setPublicKeyController); // set public key

// signature
app.post("/upload_signature", uploadSignatureController); // upload the signature on chain

// proofs
app.post("/verify_public_inputs", verifyPublicInputsPoPController); // verify the public inputs (PoP)
app.post("/verify_proof", verifyProofPoPController); // verify the proof (PoP)

// TODO
app.get("/available_functions", getAvailableFunctionsController);
app.post("/generate_proof_function", generateProofFunctionController);


// init compute proof helpers in the background (takes time)
(async() => {
    await initHelpers();
})();

deploy().then(() => {
    const server = app.listen(port, () =>
        console.log(`Server started on port ${port}`)
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