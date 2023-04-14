const { getAddress } = require('./accounts.js');
const { setPublicKey, getPublicKey } = require('./actions/publicKeys.js');
const { mint, getTokenId } = require('./actions/tokens.js');
const { contracts } = require('./contracts/contracts.js');

const express = require('express');
const app = express();

// server port
const port = 3000;

app.set('json spaces', 4);

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
            expected_header: '{ "from": "owner|hospital|researcher|any" }'
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
    expected_url = "/publickey?name={name}&version={version}";

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
            expected_header: '{ "from": "owner|hospital|researcher|any" }'
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