const { GrumpkinAddress } = require('@noir-lang/barretenberg/dest/address');

function generateAbi(schnorr, privateKey, message) {
    const pubKey = schnorr.computePublicKey(privateKey)
    const publicKey = new GrumpkinAddress(pubKey);
    const signature = Array.from(
        schnorr.constructSignature(message, privateKey).toBuffer()
    );

    return {
        message,
        pub_key_x: '0x' + publicKey.x().toString('hex'),
        pub_key_y: '0x' + publicKey.y().toString('hex'),
        signature
    }
}

module.exports = { generateAbi }
