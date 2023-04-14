const { getAddress } = require('./accounts.js');
const { mint } = require('./actions/mint.js');
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
        return;
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