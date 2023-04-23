const { GrumpkinAddress } = require('@noir-lang/barretenberg/dest/address');
const { Schnorr } = require('@noir-lang/barretenberg/dest/crypto/schnorr');
const { createHash, randomBytes } = require('crypto');

class BarretenbergHelper {
    constructor(barretenberg) {
        this.schnorr = new Schnorr(barretenberg);
    }

    signHash(privateKey, hashHex) {
        const hash = hexToBytes(hashHex);
        const signature = Array.from(
            this.schnorr.constructSignature(hash, privateKey).toBuffer()
        );

        return signature;
    }

    getRandomGrumpkinPublicKey() {
        const pubKey = this.schnorr.computePublicKey(randomBytes(32));
        const publicKey = new GrumpkinAddress(pubKey);
        return publicKey.toString();
    }

    getGrumpkinPublicKey(privateKey) {
        const pubKey = this.schnorr.computePublicKey(privateKey);
        const publicKey = new GrumpkinAddress(pubKey);
        return publicKey.toString();
    }
}

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function hashData(data) {
    return createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex');
}

module.exports = { BarretenbergHelper, hashData, hexToBytes }