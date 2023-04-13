const { GrumpkinAddress } = require('@noir-lang/barretenberg/dest/address');

function generateAbi(schnorr, privateKey, hashHex) {
    const pubKey = schnorr.computePublicKey(privateKey);
    const publicKey = new GrumpkinAddress(pubKey);
    const hash = hexToBytes(hashHex);
    const signature = Array.from(
        schnorr.constructSignature(hash, privateKey).toBuffer()
    );

    return {
        pub_key_x: '0x' + publicKey.x().toString('hex'),
        pub_key_y: '0x' + publicKey.y().toString('hex'),
        signature,
        hash
    }
}

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

module.exports = { generateAbi }