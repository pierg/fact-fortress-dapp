const { initCircuitsHelpers } = require("./frontend_helpers/proof.js");
const { contractsHelper } = require("./contracts/contracts.js");
const clc = require('cli-color');
const morgan = require('morgan')

const { healthController } = require("./controllers/health.controller.js");
const {
    authorizeProviderController,
    authorizeDataAnalystController,
    getProviderTokenIdController,
    getAnalystTokenIdController,
    getAllAccessPoliciesController,
    setAllAccessPoliciesController,
    getAccessPoliciesController,
} = require("./controllers/nft.controller.js");
const {
    getPublicKeyController,
    setPublicKeyController,
    resetPublicKeysController
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
    getAccountsController,
    resetAccountsController,
} = require("./frontend_helpers/accounts.js");
const {
    generateProofController,
    verifyPublicInputsPoPController,
    verifyProofController
} = require("./controllers/proof.controller.js");
const {
    getDataController,
    setDataController,
} = require("./controllers/data.controller.js");

const express = require("express");
const app = express();
app.use(express.json());
app.use(morgan('dev'))

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
    await contractsHelper.add({
        "filename": "dataProvidersNFTs.sol",
        "name": "DataProvidersNFTs",
    });

    await contractsHelper.add({
        "filename": "dataAnalystsNFTs.sol",
        "name": "DataAnalystsNFTs",
        "args": [
            contractsHelper.getAddress("DataProvidersNFTs"),
        ],
    });

    await contractsHelper.add({
        "filename": "verifierProvenance.sol",
        "name": "VerifierProvenance",
        "is_verifier": true,
        "circuit_name": "schnorr", // i.e., name of the directory that contains the circuit
        "circuit_purpose": "proof_of_provenance", // i.e., statement_function
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
        "filename": "factFortress.sol",
        "name": "FactFortress",
        "args": [
            contractsHelper.getAddress("DataProvidersNFTs"),
            contractsHelper.getAddress("DataAnalystsNFTs"),
            contractsHelper.getAddress("VerifierProvenance"),
        ],
    });

    console.log(clc.green("► Contracts deployed ✓"));
}

// frontend helpers -- in Production, should be done offline --
app.get("/health", healthController); // ensure the service is healthy
app.get("/accounts", getAccountsController); // get accounts
app.get("/key_pair", generateKeyPairController); // generate private/public key keypair
app.post("/sign_hash", signHashController); // sign a hashed message
app.post("/sign_message", signMessageController); // hash and sign a message
app.post("/generate_proof", generateProofController); // generate the proof
app.get("/available_functions", getAvailableFunctionsController);
app.get("/reset_accounts", resetAccountsController); // reset all accounts

// authorizations (NFTs)
app.get("/authorize_provider", authorizeProviderController); // authorize a data provider (mint NFT and send)
app.post("/authorize_analyst", authorizeDataAnalystController); // authorize a data analyst (mint NFT and send)
app.get("/provider_token_id", getProviderTokenIdController); // get NFT ID associated with a data provider address
app.get("/analyst_token_id", getAnalystTokenIdController); // get NFT ID associated with a data analyst address
app.post("/all_access_policies", setAllAccessPoliciesController); // set all access policies
app.get("/all_access_policies", getAllAccessPoliciesController); // get all access policies
app.get("/access_policies", getAccessPoliciesController); // get access policy by address

// public keys
app.get("/publickey", getPublicKeyController); // get public key
app.put("/publickey", setPublicKeyController); // set public key
app.get("/reset_public_keys", resetPublicKeysController); // reset all public keys

// data
app.post("/set_data", setDataController); // set data source
app.get("/get_data", getDataController); // get data source

// signature
app.post("/upload_signature", uploadSignatureController); // upload the signature on chain

// proofs
app.post("/verify_public_inputs", verifyPublicInputsPoPController); // verify the public inputs (PoP)
app.post("/verify_proof", verifyProofController); // verify the proof

deployContracts().then(() => {
    // init circuits helpers in the background (takes time)
    initCircuitsHelpers().then(async() => {
        const server = app.listen(port, () =>
            console.log(clc.green.bold(`► Server started on port ${port} ✓`))
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
            }, 100000);

            connections.forEach((curr) => curr.end());
            setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
        }
    });
});