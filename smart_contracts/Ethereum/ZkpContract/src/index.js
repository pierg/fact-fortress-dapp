const { AccountsIds, getAddress } = require('./accounts.js');
const { Contracts } = require('./contracts/contracts.js');
const express = require('express');
const app = express();

let contracts = new Contracts;

app.set('json spaces', 4);

// Health endpoint
app.get('/health', (req, res) => {
    res.sendStatus(200);
});

// Mint endpoint
app.get('/mint', async(req, res) => {
    const recipient = req.query.recipient;
    if (!recipient) {
        res.status(500).json({
            error: "no recipient has been provided ()",
            expected_url: "/mint?recipient={address}"
        })
        return;
    }

    const sender = getAddress(AccountsIds.Owner);
    const sc = contracts.getContract("ZkpToken");

    try {
        const receipt = await sc.methods.mint(recipient).send({ from: sender, gas: '1000000' });
        console.log(`token minted: ${receipt.transactionHash}`);
        res.status(200).json({
            receipt
        })
    } catch (e) {
        console.error(e.reason);
        res.status(500).json({
            error: e
        })
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
    app.listen(3000, async() => {
        console.log('Server started on port 3000');
    });
});