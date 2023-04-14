const { contracts } = require('../contracts/contracts.js');

async function setPublicKey(from, tokenId, name, publicKey) {
    const sc = contracts.getContract("ZkpContract");

    try {
        const receipt = await sc.methods.setPublicKey(
            tokenId,
            name,
            publicKey
        ).send({ from, gas: '1000000' });

        const publicKeyVersion = receipt.events.PublicKeyVersion.returnValues[0];

        console.log(`Public key set: v${publicKeyVersion}`);

        return {
            name,
            "public_key": publicKey,
            "public_key_version": publicKeyVersion
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