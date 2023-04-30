const { BarretenbergHelper } = require("../../test/helpers.js");
const { createHash, randomBytes } = require("crypto");
const { BarretenbergWasm } = require("@noir-lang/barretenberg/dest/wasm");

let helper;

async function generateKeyPair() {
    if (typeof helper === undefined || !helper) {
        barretenbergWasm = await BarretenbergWasm.new();
        helper = new BarretenbergHelper(barretenbergWasm);
    }
    const privateKey = randomBytes(32);
    const publicKey = helper.getGrumpkinPublicKey(privateKey);
    // TODO: Can i get public_key x, y ?

    return {
        public_key: publicKey,
        private_key: privateKey.toString("hex"),
    };
}

// hash and sign a message
async function signMessage(privateKey, message) {
    if (typeof helper === undefined || !helper) {
        barretenbergWasm = await BarretenbergWasm.new();
        helper = new BarretenbergHelper(barretenbergWasm);
    }

    const hash = createHash("sha256")
        .update(JSON.stringify(message))
        .digest("hex");

    const privKeyBytes = Buffer.from(privateKey, "hex");

    const signature = helper.signHash(privKeyBytes, hash);
    return {
        hash,
        signature,
        message: {
            type: "info",
            message: "message signed with the private keys"
        }
    };
}

// sign data that has already been hashed
async function signHash(privateKey, hash) {
    if (typeof helper === undefined || !helper) {
        barretenbergWasm = await BarretenbergWasm.new();
        helper = new BarretenbergHelper(barretenbergWasm);
    }

    const privKeyBytes = Buffer.from(privateKey, "hex");

    const signature = helper.signHash(privKeyBytes, hash);
    return {
        hash,
        signature,
    };
}

module.exports = { generateKeyPair, signHash, signMessage };