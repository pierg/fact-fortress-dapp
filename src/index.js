const { getAddress } = require('./accounts.js');
const { setPublicKey, getPublicKey } = require('./actions/keypair.js');
const { mint, getTokenId } = require('./actions/tokens.js');
const { contracts } = require('./contracts/contracts.js');
const { verifyPublicInputs, verifyProof } = require('./actions/proof.js');

// frontend helpers (would not be used in Production)
const { generateKeyPair, signMessage } = require('./frontend_helpers/keypair.js');
const { computeProof } = require('./frontend_helpers/proof.js');


const express = require('express');
const app = express();

// server port
const port = 3000;

app.set('json spaces', 4);
app.use(express.json())

function getFrom(req) {
    if (!req.headers['from']) {
        return;
    }

    return getAddress(req.headers['from']);
}

// Health endpoint
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

// Mint endpoint
app.get('/mint', async(req, res) => {
    const recipient = req.query.recipient;
    if (!recipient) {
        return res.status(500).json({
            error: "no recipient has been provided",
            expected_url: "/mint?recipient={address}"
        })
    }

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|hospitalA|hospitalB|hospitalC|researcher|any" }'
        })
    }

    const result = await mint(from, recipient);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

// Get TokenID endpoint
app.get('/tokenid', async(req, res) => {
    const address = req.query.address;
    if (!address) {
        return res.status(500).json({
            error: "no address has been provided",
            expected_url: "/tokenid?address={address}"
        })
    }

    const result = await getTokenId(address);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

// Get public key endpoint
app.get('/publickey', async(req, res) => {
    expected_url = "/publickey?token_id={token_id}&name={name}&version={version}";

    const tokenId = req.query.token_id;
    if (!tokenId) {
        return res.status(500).json({
            error: "no token ID has been provided",
            expected_url
        })
    }

    const name = req.query.name;
    if (!name) {
        return res.status(500).json({
            error: "no name for the public key has been provided",
            expected_url
        })
    }

    const version = req.query.version;
    if (!version) {
        return res.status(500).json({
            error: "no version has been provided",
            expected_url
        })
    }

    const result = await getPublicKey(tokenId, name, version);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});


// Set public key endpoint
app.put('/publickey', async(req, res) => {
    expected_url = "/publickey?token_id={token_id}&name={name}&public_key={public_key}";

    const from = getFrom(req);
    if (typeof from === undefined || !from) {
        return res.status(500).json({
            error: "`from` header is not properly set",
            expected_header: '{ "from": "owner|hospitalA|hospitalB|hospitalC|researcher|any" }'
        })
    }

    const tokenId = req.query.token_id;
    if (!tokenId) {
        return res.status(500).json({
            error: "no token ID has been provided",
            expected_url
        })
    }

    const name = req.query.name;
    if (!name) {
        return res.status(500).json({
            error: "no name for the public key has been provided",
            expected_url
        })
    }

    const publicKey = req.query.public_key;
    if (!publicKey) {
        return res.status(500).json({
            error: "no public key has been provided",
            expected_url
        })
    }

    const result = await setPublicKey(from, tokenId, name, publicKey);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

async function deploy() {
    await contracts.add("zkpToken.sol", "ZkpToken");
    await contracts.add("zkpVerifier.sol", "ZkpVerifier");
    await contracts.add(
        "zkpContract.sol",
        "ZkpContract", [
            contracts.getAddress("ZkpToken"),
            contracts.getAddress("ZkpVerifier"),
        ]
    );
}

// Generate keypair endpoint
app.get('/key_pair', async(req, res) => {
    const result = await generateKeyPair();

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

// Generate proof endpoint
app.post('/generate_proof', async(req, res) => {
    const publicKey = req.query.public_key;
    if (!publicKey) {
        return res.status(500).json({
            error: "no public key has been provided",
            expected_url: "/generate_proof?public_key={public_key}"
        })
    }

    const hash = req.body['hash'];
    if (!hash) {
        return res.status(500).json({
            error: "no hash has been provided in the body of the request",
        })
    }

    const signature = req.body['signature'];
    if (!signature) {
        return res.status(500).json({
            error: "no signature has been provided in the body of the request",
        })
    }

    const result = await computeProof(publicKey, hash, signature);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

// Sign message endpoint
app.post('/sign', async(req, res) => {
    const privateKey = req.body['private_key'];
    if (!privateKey) {
        return res.status(500).json({
            error: "no private key has been provided in the body of the request",
        })
    }

    const message = req.body['message'];
    if (!message) {
        return res.status(500).json({
            error: "no message has been provided in the body of the request",
        })
    }

    const result = await signMessage(privateKey, message);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

// Verify public inputs endpoint
app.post('/verify_public_inputs', async(req, res) => {
    const publicKey = req.query.public_key;
    if (!publicKey) {
        return res.status(500).json({
            error: "no public key has been provided",
            expected_url: "/verify_public_inputs?public_key={public_key}"
        })
    }

    const proof = req.body;
    if (!proof) {
        return res.status(500).json({
            error: "no proof has been provided in the body of the request",
        })
    }

    const result = await verifyPublicInputs(publicKey, proof);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

// Verify proof endpoint
app.post('/verify_proof', async(req, res) => {
    const proof = req.body;
    if (!proof) {
        return res.status(500).json({
            error: "no proof has been provided in the body of the request",
        })
    }

    const result = await verifyProof(proof);

    if (result.error) {
        res.status(500).json({
            error: result.error,
        });
    } else {
        res.status(200).json(result);
    }
});

async function deploy() {
    await contracts.add("zkpToken.sol", "ZkpToken");
    await contracts.add("zkpVerifier.sol", "ZkpVerifier");
    await contracts.add(
        "zkpContract.sol",
        "ZkpContract", [
            contracts.getAddress("ZkpToken"),
            contracts.getAddress("ZkpVerifier"),
        ]
    );
}

deploy().then(() => {
    const server = app.listen(port, () => console.log(`Server started on port ${port}`));

    process.on('SIGTERM', shutDown);
    process.on('SIGINT', shutDown);

    let connections = [];

    server.on('connection', connection => {
        connections.push(connection);
        connection.on('close', () => connections = connections.filter(curr => curr !== connection));
    });

    function shutDown() {
        console.log('Received kill signal, shutting down gracefully');
        server.close(() => {
            console.log('Closed out remaining connections');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);

        connections.forEach(curr => curr.end());
        setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
    }
});
