const { contracts } = require('../contracts/contracts.js');
const { BarretenbergHelper } = require('./../../test/helpers.js');
const { createHash, randomBytes } = require('crypto');
const { BarretenbergWasm } = require('@noir-lang/barretenberg/dest/wasm');

let helper;

async function generateKeyPair() {
    if (typeof helper === undefined || !helper) {
        barretenbergWasm = await BarretenbergWasm.new();
        helper = new BarretenbergHelper(barretenbergWasm);
    }
    const privateKey = randomBytes(32);
    const publicKey = helper.getGrumpkinPublicKey(privateKey);

    return {
        public_key: publicKey,
        private_key: privateKey.toString('hex'),
    }
}

async function setPublicKey(from, tokenId, name, publicKey) {
    const sc = contracts.getContract("ZkpContract");

    try {
        const receipt = await sc.methods.setPublicKey(
            tokenId,
            name,
            publicKey
        ).send({ from, gas: '1000000' });

        const publicKeyVersion = receipt.events.PublicKeyVersion.returnValues[0];

        console.log(`Public key set: ${publicKeyVersion}`);

        return {
            name,
            public_key: publicKey,
            public_key_version: publicKeyVersion
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

async function signMessage(privateKey, message) {
    if (typeof helper === undefined || !helper) {
        barretenbergWasm = await BarretenbergWasm.new();
        helper = new BarretenbergHelper(barretenbergWasm);
    }

    const hash = createHash('sha256')
        .update(JSON.stringify(message))
        .digest('hex');

    const privKeyBytes = Buffer.from(privateKey, "hex")

    const signature = helper.signHash(privKeyBytes, hash);
    return {
        hash,
        signature
    }
}

module.exports = { generateKeyPair, getPublicKey, setPublicKey, signMessage };