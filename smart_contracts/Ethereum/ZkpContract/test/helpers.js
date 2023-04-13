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

    generateAbi(pubKey, hashHex, signature) {
        const publicKeyXY = this.extractXYFromGrumpkinPublicKey(pubKey);

        return {
            pub_key_x: '0x' + publicKeyXY.x.toString('hex'),
            pub_key_y: '0x' + publicKeyXY.y.toString('hex'),
            signature,
            hash: hexToBytes(hashHex)
        }
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

    extractXYFromGrumpkinPublicKey(pubKey) {
        const publicKey = new GrumpkinAddress(Buffer.from(pubKey.replace(/^0x/i, ''), 'hex'));

        return {
            x: publicKey.x(),
            y: publicKey.y(),
        }
    }
}

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function hashHealthData(healthData) {
    return createHash('sha256')
        .update(JSON.stringify(healthData))
        .digest('hex');
}

module.exports = { BarretenbergHelper, hashHealthData, hexToBytes }