const { contracts } = require('../contracts/contracts.js');

async function mint(from, recipient) {
    const sc = contracts.getContract("ZkpHealthToken");

    try {
        const receipt = await sc.methods.mint(recipient).send({ from, gas: '1000000' });
        const tokenId = receipt.events.Transfer.returnValues.tokenId;
        console.log(`token minted: ${tokenId} — tx ${receipt.transactionHash}`);
        return {
            recipient,
            token_id: tokenId,
        };
    } catch (e) {
        console.error(e.reason);
        return {
            error: e
        };
    }
}

async function getTokenId(address) {
    const sc = contracts.getContract("ZkpHealthToken");

    try {
        const tokenId = await sc.methods.userToToken(address).call();
        console.log(`Address ${address} has token #${tokenId}`);
        return {
            address,
            token_id: tokenId,
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Address does not have a token",
        };
    }
}

module.exports = { mint, getTokenId };