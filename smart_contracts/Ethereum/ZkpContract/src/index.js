const express = require('express');
const app = express();

const server = require('./ganache.js');
const deploy = require('./deploy.js');
const { compile } = require('./compile.js');
const Web3 = require('web3');
const web3 = new Web3(server.provider);

async function init() {
    // compile contracts
    const zkpToken = compile("zkpToken.sol", "ZkpToken");
    const zkpVerifier = compile("zkpVerifier.sol", "ZkpVerifier");
    const zkpContract = compile('zkpContract.sol', 'ZkpContract');

    // deploy contracts
    zkpTokenAddress = await deploy(web3, zkpToken);
    zkpVerifierAddress = await deploy(web3, zkpVerifier);
    zkpContractAddress = await deploy(web3, zkpContract, [
        zkpTokenAddress, zkpVerifierAddress]
    );
}

// Health endpoint
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

// Start server
app.listen(3000, async () => {
    // wait for the contracts to be deployed
    await init();

    console.log('Server started on port 3000');
});

