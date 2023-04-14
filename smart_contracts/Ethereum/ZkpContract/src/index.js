const { Contracts } = require('./contracts/contracts.js');

const express = require('express');
const app = express();

let contracts = new Contracts;

// Health endpoint
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

// Start server
app.listen(3000, async() => {
    // wait for the contracts to be deployed
    await contracts.add("zkpToken.sol", "ZkpToken");
    await contracts.add("zkpVerifier.sol", "ZkpVerifier");
    await contracts.add(
        "zkpContract.sol",
        "ZkpContract", [
            contracts.getAddress("ZkpToken"),
            contracts.getAddress("ZkpVerifier"),
        ]
    );

    console.log('Server started on port 3000');
});