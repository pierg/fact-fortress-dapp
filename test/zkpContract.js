const ZkpContract = artifacts.require('ZkpContract');
const ZkpToken = artifacts.require('ZkpToken');
const ZkpVerifier = artifacts.require("ZkpVerifier");

const { BarretenbergHelper, hashHealthData } = require('./helpers');

const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect;
const { resolve } = require('path');

const { setup_generic_prover_and_verifier, create_proof, verify_proof } = require('@noir-lang/barretenberg/dest/client_proofs');
const { compile } = require('@noir-lang/noir_wasm');
const { BarretenbergWasm } = require('@noir-lang/barretenberg/dest/wasm');
const { randomBytes } = require('crypto');

const fs = require('fs');

contract('ZkpContract', function (accounts) {
    const healthData = {
        "patient_id_0": {
            "genetic_data": {
                "rs10757274": "AA",
                "rs562556": "AA",
                "rs429358": "TT",
                "rs7412": "TT",
                "rs1801133": "TT"
            },
            "name": "Charlie"
        },
        "patient_id_1": {
            "genetic_data": {
                "rs10757274": "GG",
                "rs562556": "AG",
                "rs429358": "TT",
                "rs7412": "CT",
                "rs1801133": "TT"
            },
            "name": "Alice"
        }
    }

    // contracts
    let zkpContractInstance; // Main contract
    let zkpTokenInstance; // NFTs
    let zkpVerifierInstance; // Noir verifier

    // accounts
    const hospitalA = accounts[0];
    const hospitalB = accounts[1];
    const hospitalC = accounts[2];
    const anyone = accounts[3];

    // ZKP verifier part
    let compiledProgram, acir, prover, verifier, validAbi;

    before(async () => {
        try {
            compiledProgram = compile(resolve(__dirname, '../circuits/src/main.nr'));
        } catch (e) {
            console.log(e);
            process.exit(1);
        }

        acir = compiledProgram.circuit;
        [prover, verifier] = await setup_generic_prover_and_verifier(acir);

        // instantiate Barretenberg WASM to use Grumpkin curve
        barretenberg = await BarretenbergWasm.new();
        helper = new BarretenbergHelper(barretenberg);
    })

    beforeEach(async () => {
        zkpTokenInstance = await ZkpToken.new();
        zkpVerifierInstance = await ZkpVerifier.new();
        zkpContractInstance = await ZkpContract.new(zkpTokenInstance.address, zkpVerifierInstance.address);
    });

    after(async () => {
        // save valid ABI in `Prover.toml`
        if (validAbi !== null) {
            let prover = `pub_key_x = ${JSON.stringify(validAbi.pub_key_x)}\n`;
            prover += `pub_key_y = ${JSON.stringify(validAbi.pub_key_y)}\n`;
            prover += `signature = ${JSON.stringify(validAbi.signature)}\n`;
            prover += `hash = ${JSON.stringify(validAbi.hash)}\n`;
            fs.writeFileSync(resolve(__dirname, '../circuits/Prover.toml'), prover);
        }
    });

    // PUBLIC KEYS MANAGEMENT

    describe("Public keys management with NFTs", async () => {

        it("should allow an authorized hospital with a valid ZKP token to add their public key", async () => {
            // Mint a new ZKP token for hospitalA
            await zkpTokenInstance.mint(hospitalA);

            // Set hospitalA's public key
            const name = "Hospital A";
            const publicKey = helper.getRandomGrumpkinPublicKey();

            await zkpContractInstance.setPublicKey(name, publicKey, { from: hospitalA })

            // Verify that hospitalA's public key was set correctly
            const retrievedPublicKey = await zkpContractInstance.getPublicKey(name, 0);
            assert.equal(retrievedPublicKey, publicKey, "Public key was not set correctly");
        });

        it("should allow an authorized hospital with a valid ZKP token to add new public keys", async () => {
            // Mint a new ZKP token for hospitalA
            await zkpTokenInstance.mint(hospitalA);

            const name = "Hospital A";
            const publicKey1 = helper.getRandomGrumpkinPublicKey();
            const publicKey2 = helper.getRandomGrumpkinPublicKey();
            const publicKey3 = helper.getRandomGrumpkinPublicKey();
            const publicKey4 = helper.getRandomGrumpkinPublicKey();

            // Set hospitalA's first public key
            await zkpContractInstance.setPublicKey(name, publicKey1, { from: hospitalA })

            // Set hospitalA's second public key
            await zkpContractInstance.setPublicKey(name, publicKey2, { from: hospitalA })

            // Set hospitalA's third public key
            await zkpContractInstance.setPublicKey(name, publicKey3, { from: hospitalA })

            // Set hospitalA's fourth public key
            await zkpContractInstance.setPublicKey(name, publicKey4, { from: hospitalA })

            // Verify that hospitalA's first public keys were set correctly
            const retrievedPublicKey1 = await zkpContractInstance.getPublicKey(name, 0);
            assert.equal(retrievedPublicKey1, publicKey1, "Public key 1 was not set correctly");

            const retrievedPublicKey2 = await zkpContractInstance.getPublicKey(name, 1);
            assert.equal(retrievedPublicKey2, publicKey2, "Public key 2 was not set correctly");

            const retrievedPublicKey3 = await zkpContractInstance.getPublicKey(name, 2);
            assert.equal(retrievedPublicKey3, publicKey3, "Public key 3 was not set correctly");

            const retrievedPublicKey4 = await zkpContractInstance.getPublicKey(name, 3);
            assert.equal(retrievedPublicKey4, publicKey4, "Public key 4 was not set correctly");

            // Verify hospitalA's most recent public key
            const retrievedLatestPublicKey = await zkpContractInstance.getLatestPublicKey(name);
            assert.equal(retrievedLatestPublicKey, publicKey4, "Latest public key was not set correctly");
        });

        it("should allow an hospital to update their own public key", async () => {
            // Mint a new ZKP token for hospitalA
            await zkpTokenInstance.mint(hospitalA);

            // Set hospitalA's initial public key
            const initialName = "Hospital A";
            const initialPublicKey = helper.getRandomGrumpkinPublicKey();
            await zkpContractInstance.setPublicKey(initialName, initialPublicKey, { from: hospitalA });

            // Update hospitalA's public key
            const updatedName = "Hospital A";
            const updatedPublicKey = helper.getRandomGrumpkinPublicKey();
            await zkpContractInstance.setPublicKey(updatedName, updatedPublicKey, { from: hospitalA });

            // Verify that hospitalA's public key was updated correctly
            const retrievedPublicKey = await zkpContractInstance.getPublicKey(updatedName, 1);
            assert.equal(retrievedPublicKey, updatedPublicKey, "Public key was not updated correctly");
        });

        it("should not allow an unauthorized hospital/user to set a public key", async () => {
            // Mint a new ZKP token for hospitalA
            await zkpTokenInstance.mint(hospitalA);
            const name = "Hospital A";

            // Try to set a public key for the third account using the second account's ZKP token
            await expect(zkpContractInstance.setPublicKey(name, helper.getRandomGrumpkinPublicKey(), { from: hospitalB }))
                .to.be.rejectedWith("VM Exception while processing transaction: revert Caller is not authorized to set a public key -- Reason given: Caller is not authorized to set a public key.");

            // Verify that the public key was not set
            await expect(zkpContractInstance.getLatestPublicKey(name))
                .to.be.rejectedWith("VM Exception while processing transaction: revert Public key does not exist for this token ID and name");
        });

        it("should not allow setting a public key with an empty string", async () => {
            // Mint a new ZKP token for hospitalA
            await zkpTokenInstance.mint(hospitalA);

            // Try to set an empty public key for hospitalA
            const name = "Hospital A";
            await expect(zkpContractInstance.setPublicKey(name, "", { from: hospitalA }))
                .to.be.rejectedWith("VM Exception while processing transaction: revert Public key cannot be empty");

            // Verify that the public key was not set
            await expect(zkpContractInstance.getLatestPublicKey(name))
                .to.be.rejectedWith("VM Exception while processing transaction: revert Public key does not exist for this token ID and name");
        });

        it("should not allow an authorized hospital to modify another authorized hospital's public key with the same name", async () => {
            // Mint new ZKP tokens for hospitalA and hospitalB
            await zkpTokenInstance.mint(hospitalA);
            await zkpTokenInstance.mint(hospitalB);
            const name = "Hospital A";

            const hospitalATokenId = await zkpTokenInstance.userToToken(hospitalA);
            const hospitalBTokenId = await zkpTokenInstance.userToToken(hospitalB);

            // set public key for Hospital A's token and name "hospital A"
            await zkpContractInstance.setPublicKey(name, helper.getRandomGrumpkinPublicKey());

            // set public key for Hospital A's token and name "hospital A" by hospitalB
            try {
                await zkpContractInstance.setPublicKey(name, helper.getRandomGrumpkinPublicKey(), {
                    from: hospitalB,
                });
            } catch (error) {
                assert.equal(
                    error.reason,
                    "Caller is not authorized to update the public key",
                    "Should not allow an authorized hospital to modify another authorized hospital's public key with the same name"
                );
            }
        });
    });

    it("should allow an authorized hospital to transfer their token and the new address to update their public key", async () => {
        const hospitalANewAddress = accounts[2];

        // Mint a new ZKP token for hospitalA
        await zkpTokenInstance.mint(hospitalA);
        const tokenId = await zkpTokenInstance.userToToken(hospitalA);

        // Set hospitalA's public key
        const name = "Hospital A";
        const publicKey = helper.getRandomGrumpkinPublicKey();
        await zkpContractInstance.setPublicKey(name, publicKey, { from: hospitalA });

        // Transfer the token to the new address
        await zkpTokenInstance.transferFrom(hospitalA, hospitalANewAddress, tokenId, { from: hospitalA });

        // Set hospitalA's new public key with the new address
        const newPublicKey = helper.getRandomGrumpkinPublicKey();
        await zkpContractInstance.setPublicKey(name, newPublicKey, { from: hospitalANewAddress });

        // Verify that hospitalA's new public key was set correctly
        const retrievedNewPublicKey = await zkpContractInstance.getLatestPublicKey(name);
        assert.equal(retrievedNewPublicKey, newPublicKey, "Public key was not set correctly");
    });

    // PROOFS VERIFICATION

    describe("Verification of proofs", async () => {
        const hash = hashHealthData(healthData);

        describe("simplified flow", async () => {

            it("signature stored", async () => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                validAbi = helper.generateAbi(publicKey, hash, signature);

                const proof = await create_proof(prover, acir, validAbi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(true);

                // store the signature and assert it has been stored

                // prerequisite: the hospital that stores its signature is authorized
                // to do so thanks to its NFT
                await zkpTokenInstance.mint(hospitalA);

                await zkpContractInstance.storeSignature(
                    publicKey,
                    signature,
                    { from: hospitalA }
                );

                const signatureStored = await zkpContractInstance
                    .checkSignature(
                        publicKey,
                        signature,
                    );

                expect(signatureStored).eq(true);
            });

            it("signature not stored", async () => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                validAbi = helper.generateAbi(publicKey, hash, signature);

                const proof = await create_proof(prover, acir, validAbi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(true);

                // assert the the signature has not been stored
                const signatureStored = await zkpContractInstance
                    .checkSignature(
                        publicKey,
                        signature
                    );

                expect(signatureStored).eq(false);
            });


            it("valid proof of provenance", async () => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                await zkpTokenInstance.mint(hospitalA);

                await zkpContractInstance.storeSignature(
                    publicKey,
                    signature,
                    { from: hospitalA }
                );

                validAbi = helper.generateAbi(publicKey, hash, signature);

                const proof = await create_proof(prover, acir, validAbi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(true);

                const publicKeyResult = await zkpContractInstance
                    .verifyPublicInputsPoP(
                        publicKey,
                        proof
                    );
                expect(publicKeyResult).eq(true);

                const smartContractResult = await zkpContractInstance.verifyProofPoP(proof);
                expect(smartContractResult).eq(true);
            });

            it("invalid proof of provenance", async () => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                const abi = helper.generateAbi(publicKey, hash, signature);

                // falsify the signature to make it invalid and fail the proof
                abi.signature[0] = (abi.signature[0] + 1) % 256;

                const proof = await create_proof(prover, acir, abi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(false);

                await expect(zkpContractInstance.verifyProofPoP(proof))
                    .to.be.rejectedWith("VM Exception while processing transaction: revert Proof failed");
            });
        });

        describe("complete flow", async () => {
            it("valid proof", async () => {
                // [HOSPITAL] ////////////////////////////////////////////////

                // Step 1. The hospital uploads its public key
                const name = "Hospital C";

                // a) Mint a new ZKP token for the hospital
                await zkpTokenInstance.mint(hospitalC);

                // b) Upload hospital's public key
                const privateKey = randomBytes(32);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);
                await zkpContractInstance.setPublicKey(name, publicKey, { from: hospitalC })

                // Step 2. Make the hospital sign the data
                const signature = helper.signHash(privateKey, hash);

                // Step 3. The hospital stores the signature on-chain
                await zkpContractInstance.storeSignature(
                    publicKey,
                    signature,
                    { from: hospitalC }
                );

                // [RESEARCHER] //////////////////////////////////////////////

                // Step 4. Researcher gets the hospital's public key

                // a) Data shared with the researcher
                const hospitalNameP = name; // communicated by the hospital
                const publicKeyVersionP = 0; // communicated by the hospital

                // b) Data fetched by the researcher on-chain
                const hospitalPublicKeyP = await zkpContractInstance.getPublicKey(
                    hospitalNameP, publicKeyVersionP
                );

                // Step 5. Researcher generates the proof off-chain

                // a) Data shared with the researcher
                const hospitalHashP = hash; // communicated by the hospital
                const hospitalSignatureP = signature; // communicated by the hospital

                // b) Generation of the proof
                const abi = helper.generateAbi(hospitalPublicKeyP, hospitalHashP, hospitalSignatureP);
                const proof = await create_proof(prover, acir, abi);

                // c) (sanity check) The researcher verifies off-chain that the proof is valid
                const verified = await verify_proof(verifier, proof);
                expect(verified).eq(true);


                // [VERIFIER] ////////////////////////////////////////////////

                // Step 6. Verifier gets the proof and verifies the public key

                // a) Data shared with the verifier
                const hospitalNameV = name; // communicated by the hospital
                const publicKeyVersionV = 0; // communicated by the hospital
                const proofV = proof; // communicated by the researcher (on-chain or off-chain?)

                // b) Data fetched by the verifier on the blockchain
                const hospitalPublicKeyV = await zkpContractInstance.getPublicKey(
                    hospitalNameV, publicKeyVersionV
                );

                // d) (Verification A) 
                // The verifier ensures that the public key is the expected one
                // as well as the signature
                // (Note: this step can also be done off-chain if needed)
                const publicKeyMatch = await zkpContractInstance.verifyPublicInputsPoP(
                    hospitalPublicKeyV,
                    proofV,
                );
                expect(publicKeyMatch).eq(true);

                // e) (Verification B) 
                // The verifier verifies the proof of provenance
                const proofVerified = await zkpContractInstance.verifyProofPoP(proofV);
                expect(proofVerified).eq(true);
            });
        });
    });
});
