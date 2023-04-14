const { contracts } = require('../contracts/contracts.js');

async function mint(from, recipient) {
    const sc = contracts.getContract("ZkpToken");

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

module.exports = { mint };