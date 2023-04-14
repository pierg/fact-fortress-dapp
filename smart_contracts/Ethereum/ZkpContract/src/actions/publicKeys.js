const { contracts } = require('../contracts/contracts.js');

async function setPublicKey(from, tokenId, name, publicKey) {
    const sc = contracts.getContract("ZkpContract");

    try {
        await sc.methods.setPublicKey(
            tokenId,
            name,
            publicKey
        ).send({ from, gas: '1000000' });

        // console.log(`Public key set: v${publicKeyVersion}`);
        return {
            name,
            publicKey,
            // TODO: return version
        };
    } catch (e) {
        console.error(e);
        return {
            error: e
        };
    }
}

async function getPublicKey(tokenId, name, version) {
    const sc = contracts.getContract("ZkpContract");

    try {
        const publicKey = await sc.methods.getPublicKey(
            tokenId,
            name,
            version
        ).call();

        return {
            public_key: publicKey,
        };
    } catch (e) {
        console.error(e);
        return {
            error: e
        };
    }
}

module.exports = { getPublicKey, setPublicKey };