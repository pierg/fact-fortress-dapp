const { contractsHelper } = require('../contracts/contracts.js');
const clc = require('cli-color');

async function setPublicKey(from, name, publicKey) {
    const sc = contractsHelper.getContractByName("FactFortress");

    try {
        const receipt = await sc.methods.setPublicKey(
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

async function getPublicKey(name, version) {
    const sc = contractsHelper.getContractByName("FactFortress");
    let publicKey;

    try {
        publicKey = await sc.methods.getPublicKey(name,
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
    } finally {
        if (publicKey) {
            console.log(`Fetched public key ${publicKey} for ${name} v${version}`)
        } else {
            console.log(clc.red(`No public key found for ${name} v${version}`))
        }
    }
}

async function storeSignature(from, publicKey, signature) {
    const sc = contractsHelper.getContractByName("FactFortress");

    try {
        await sc.methods.storeSignature(
            publicKey,
            signature
        ).send({ from, gas: '1000000' });

        return {
            stored: true,
        };
    } catch (e) {
        console.error(e);
        return {
            error: e
        };
    }
}

async function resetPublicKeys(from) {
    const sc = contractsHelper.getContractByName("FactFortress");

    try {
        await sc.methods.removeAllPublicKeys().send({ from, gas: '1000000' });

        console.log(`Public keys resetted`);

        return {
            "public_keys_resetted": true,
        };
    } catch (e) {
        console.error(e);
        return {
            error: e
        };
    }
}

module.exports = { getPublicKey, setPublicKey, storeSignature, resetPublicKeys };