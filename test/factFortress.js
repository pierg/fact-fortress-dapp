const FactFortress = artifacts.require("FactFortress");
const DataProvidersNFTs = artifacts.require("DataProvidersNFTs");
const DataAnalystsNFTs = artifacts.require("DataAnalystsNFTs");
const VerifierProvenance = artifacts.require("VerifierProvenance");

const { BarretenbergHelper, hashData } = require("./helpers");

const chai = require("chai").use(require("chai-as-promised"));
const expect = chai.expect;
const { resolve } = require("path");

const {
    setup_generic_prover_and_verifier,
    create_proof,
    verify_proof,
} = require("@noir-lang/barretenberg/dest/client_proofs");
const { compile } = require("@noir-lang/noir_wasm");
const { BarretenbergWasm } = require("@noir-lang/barretenberg/dest/wasm");
const { randomBytes } = require("crypto");

const fs = require("fs");

function generateAbiMock(args) {
    // right side: args.{name_of_key_in_request_body}
    const publicKey = args.public_key;
    const hashHex = args.hash;
    const signature = args.signature;

    // public key -> x, y
    const publicKeyXY = Buffer.from(publicKey.replace(/^0x/i, ""), "hex");
    const publicKey_x = publicKeyXY.subarray(0, 32);
    const publicKey_y = publicKeyXY.subarray(32, 64);

    // hash: hex -> bytes
    let hash = [];
    for (let c = 0; c < hashHex.length; c += 2) {
        hash.push(parseInt(hashHex.substr(c, 2), 16));
    }

    return {
        pub_key_x: "0x" + publicKey_x.toString("hex"),
        pub_key_y: "0x" + publicKey_y.toString("hex"),
        signature,
        hash,
    };
}

contract("FactFortress", function(accounts) {
    const healthData = {
        patient_id_0: {
            genetic_data: {
                rs10757274: "AA",
                rs562556: "AA",
                rs429358: "TT",
                rs7412: "TT",
                rs1801133: "TT",
            },
            name: "Charlie",
        },
        patient_id_1: {
            genetic_data: {
                rs10757274: "GG",
                rs562556: "AG",
                rs429358: "TT",
                rs7412: "CT",
                rs1801133: "TT",
            },
            name: "Alice",
        },
    };

    // contracts
    let factFortressInstance;
    let dataProvidersNFTsInstance;
    let dataAnalystsNFTsInstance;
    let verifierProvenanceInstance;

    // accounts
    const providerA = accounts[0];
    const providerB = accounts[1];
    const providerC = accounts[2];
    const analyst = accounts[3];

    // ZKP verifier part
    let compiledProgram, acir, prover, verifier, validAbi;

    before(async() => {
        try {
            compiledProgram = compile(
                resolve(__dirname, "../circuits/schnorr/src/main.nr")
            );
        } catch (e) {
            console.log(e);
            process.exit(1);
        }

        acir = compiledProgram.circuit;
        [prover, verifier] = await setup_generic_prover_and_verifier(acir);

        // instantiate Barretenberg WASM to use Grumpkin curve
        barretenberg = await BarretenbergWasm.new();
        helper = new BarretenbergHelper(barretenberg);
    });

    beforeEach(async() => {
        dataProvidersNFTsInstance = await DataProvidersNFTs.new();
        dataAnalystsNFTsInstance = await DataAnalystsNFTs.new(dataProvidersNFTsInstance.address);
        verifierProvenanceInstance = await VerifierProvenance.new();
        factFortressInstance = await FactFortress.new(
            dataProvidersNFTsInstance.address,
            dataAnalystsNFTsInstance.address,
            verifierProvenanceInstance.address
        );

        await dataAnalystsNFTsInstance.setAllAccessPolicies(["authorization_ABC", "authorization_XYZ"]);
    });

    after(async() => {
        // save valid ABI in `Prover.toml`
        if (validAbi !== null) {
            let prover = `pub_key_x = ${JSON.stringify(validAbi.pub_key_x)}\n`;
            prover += `pub_key_y = ${JSON.stringify(validAbi.pub_key_y)}\n`;
            prover += `signature = ${JSON.stringify(validAbi.signature)}\n`;
            prover += `hash = ${JSON.stringify(validAbi.hash)}\n`;
            fs.writeFileSync(resolve(__dirname, "../circuits/Prover.toml"), prover);
        }
    });

    // PUBLIC KEYS MANAGEMENT

    describe("Public keys management with NFTs", async() => {
        it("should allow an authorized data provider with a valid token to add their public key", async() => {
            // Mint a new ZKP token for providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);

            // Set providerA's public key
            const name = "Provider A";
            const publicKey = helper.getRandomGrumpkinPublicKey();

            await factFortressInstance.setPublicKey(name, publicKey, {
                from: providerA,
            });

            // Verify that providerA's public key was set correctly
            const retrievedPublicKey = await factFortressInstance.getPublicKey(name, 0);
            assert.equal(
                retrievedPublicKey,
                publicKey,
                "Public key was not set correctly"
            );
        });

        it("should allow an authorized data provider with a valid token to add new public keys", async() => {
            // Mint a new ZKP token for providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);

            const name = "Provider A";
            const publicKey1 = helper.getRandomGrumpkinPublicKey();
            const publicKey2 = helper.getRandomGrumpkinPublicKey();
            const publicKey3 = helper.getRandomGrumpkinPublicKey();
            const publicKey4 = helper.getRandomGrumpkinPublicKey();

            // Set providerA's first public key
            await factFortressInstance.setPublicKey(name, publicKey1, {
                from: providerA,
            });

            // Set providerA's second public key
            await factFortressInstance.setPublicKey(name, publicKey2, {
                from: providerA,
            });

            // Set providerA's third public key
            await factFortressInstance.setPublicKey(name, publicKey3, {
                from: providerA,
            });

            // Set providerA's fourth public key
            await factFortressInstance.setPublicKey(name, publicKey4, {
                from: providerA,
            });

            // Verify that providerA's first public keys were set correctly
            const retrievedPublicKey1 = await factFortressInstance.getPublicKey(name, 0);
            assert.equal(
                retrievedPublicKey1,
                publicKey1,
                "Public key 1 was not set correctly"
            );

            const retrievedPublicKey2 = await factFortressInstance.getPublicKey(name, 1);
            assert.equal(
                retrievedPublicKey2,
                publicKey2,
                "Public key 2 was not set correctly"
            );

            const retrievedPublicKey3 = await factFortressInstance.getPublicKey(name, 2);
            assert.equal(
                retrievedPublicKey3,
                publicKey3,
                "Public key 3 was not set correctly"
            );

            const retrievedPublicKey4 = await factFortressInstance.getPublicKey(name, 3);
            assert.equal(
                retrievedPublicKey4,
                publicKey4,
                "Public key 4 was not set correctly"
            );

            // Verify providerA's most recent public key
            const retrievedLatestPublicKey =
                await factFortressInstance.getLatestPublicKey(name);
            assert.equal(
                retrievedLatestPublicKey,
                publicKey4,
                "Latest public key was not set correctly"
            );
        });

        it("should allow a data provider to update their own public key", async() => {
            // Mint a new ZKP token for providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);

            // Set providerA's initial public key
            const initialName = "Provider A";
            const initialPublicKey = helper.getRandomGrumpkinPublicKey();
            await factFortressInstance.setPublicKey(initialName, initialPublicKey, {
                from: providerA,
            });

            // Update providerA's public key
            const updatedName = "Provider A";
            const updatedPublicKey = helper.getRandomGrumpkinPublicKey();
            await factFortressInstance.setPublicKey(updatedName, updatedPublicKey, {
                from: providerA,
            });

            // Verify that providerA's public key was updated correctly
            const retrievedPublicKey = await factFortressInstance.getPublicKey(
                updatedName,
                1
            );
            assert.equal(
                retrievedPublicKey,
                updatedPublicKey,
                "Public key was not updated correctly"
            );
        });

        it("should not allow an unauthorized data provider/user to set a public key", async() => {
            // Mint a new ZKP token for providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);
            const name = "Provider A";

            // Try to set a public key for the third account using the second account's ZKP token
            await expect(
                factFortressInstance.setPublicKey(
                    name,
                    helper.getRandomGrumpkinPublicKey(), { from: providerB }
                )
            ).to.be.rejectedWith(
                "VM Exception while processing transaction: revert Caller is not authorized to set a public key -- Reason given: Caller is not authorized to set a public key."
            );

            // Verify that the public key was not set
            await expect(
                factFortressInstance.getLatestPublicKey(name)
            ).to.be.rejectedWith(
                "VM Exception while processing transaction: revert Public key does not exist for this token ID and name"
            );
        });

        it("should not allow setting a public key with an empty string", async() => {
            // Mint a new ZKP token for providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);

            // Try to set an empty public key for providerA
            const name = "Provider A";
            await expect(
                factFortressInstance.setPublicKey(name, "", { from: providerA })
            ).to.be.rejectedWith(
                "VM Exception while processing transaction: revert Public key cannot be empty"
            );

            // Verify that the public key was not set
            await expect(
                factFortressInstance.getLatestPublicKey(name)
            ).to.be.rejectedWith(
                "VM Exception while processing transaction: revert Public key does not exist for this token ID and name"
            );
        });

        it("should not allow an authorized data provider to modify another authorized data provider's public key with the same name", async() => {
            // Mint new ZKP tokens for providerA and providerB
            await dataProvidersNFTsInstance.authorizeProvider(providerA);
            await dataProvidersNFTsInstance.authorizeProvider(providerB);
            const name = "Provider A";

            const providerATokenId = await dataProvidersNFTsInstance.userToToken(
                providerA
            );
            const providerBTokenId = await dataProvidersNFTsInstance.userToToken(
                providerB
            );

            // set public key for Provider A's token and name "data provider A"
            await factFortressInstance.setPublicKey(
                name,
                helper.getRandomGrumpkinPublicKey()
            );

            // set public key for Provider A's token and name "data provider A" by providerB
            try {
                await factFortressInstance.setPublicKey(
                    name,
                    helper.getRandomGrumpkinPublicKey(), {
                        from: providerB,
                    }
                );
            } catch (error) {
                assert.equal(
                    error.reason,
                    "Caller is not authorized to update the public key",
                    "Should not allow an authorized data provider to modify another authorized data provider's public key with the same name"
                );
            }
        });

        it("should allow an authorized data provider to transfer their token and the new address to update their public key", async() => {
            const providerANewAddress = accounts[2];

            // Mint a new ZKP token for providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);
            const tokenId = await dataProvidersNFTsInstance.userToToken(providerA);

            // Set providerA's public key
            const name = "Provider A";
            const publicKey = helper.getRandomGrumpkinPublicKey();
            await factFortressInstance.setPublicKey(name, publicKey, {
                from: providerA,
            });

            // Transfer the token to the new address
            await dataProvidersNFTsInstance.transferFrom(
                providerA,
                providerANewAddress,
                tokenId, { from: providerA }
            );

            // Set providerA's new public key with the new address
            const newPublicKey = helper.getRandomGrumpkinPublicKey();
            await factFortressInstance.setPublicKey(name, newPublicKey, {
                from: providerANewAddress,
            });

            // Verify that providerA's new public key was set correctly
            const retrievedNewPublicKey = await factFortressInstance.getLatestPublicKey(
                name
            );
            assert.equal(
                retrievedNewPublicKey,
                newPublicKey,
                "Public key was not set correctly"
            );
        });
    });

    // DATA ACCESS MANAGEMENT

    describe("Data access management", async() => {
        it("should allow an authorized provider to set a data source", async() => {
            const dataSourceId = "id-abc";
            const accessPolicies = ["authorization_ABC"];

            const dataSourceUrl = "https://example.com/abc";
            const dataSourceCredentials = "xyz";

            // Authorize providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);

            // Authorize analyst
            await dataAnalystsNFTsInstance.authorizeAnalyst(
                analyst,
                accessPolicies, { from: providerA }
            );

            // Set data source as providerA
            await factFortressInstance.setDataSource(
                dataSourceId,
                dataSourceUrl,
                dataSourceCredentials,
                accessPolicies, { from: providerA }
            );

            // Check access to data source
            const dataSource = await factFortressInstance.getDataSource(dataSourceId, { from: analyst });

            expect(dataSource.url).eq(dataSourceUrl);
            expect(dataSource.credentials).eq(dataSourceCredentials);
        });

        it("should not allow a data analyst with mismatching data access policy to access the data", async() => {
            const dataSourceId = "id-abc";
            const accessPoliciesA = ["authorization_ABC"];
            const accessPoliciesB = ["authorization_XYZ"];

            const dataSourceUrl = "https://example.com/abc";
            const dataSourceCredentials = "xyz";

            // Authorize providerA
            await dataProvidersNFTsInstance.authorizeProvider(providerA);

            // Authorize analyst with access policies A
            await dataAnalystsNFTsInstance.authorizeAnalyst(
                analyst,
                accessPoliciesA, { from: providerA }
            );

            // Set data source as providerA with _different_ access policies
            await factFortressInstance.setDataSource(
                dataSourceId,
                dataSourceUrl,
                dataSourceCredentials,
                accessPoliciesB, { from: providerA }
            );

            // Try to access the data source (should fail)
            await expect(
                factFortressInstance.getDataSource(dataSourceId, { from: analyst })
            ).to.be.rejectedWith(
                "VM Exception while processing transaction: revert Not authorized to access the data source (access policy error)"
            );
        });
    });

    // PROOFS VERIFICATION

    describe("Verification of proofs", async() => {
        const hash = hashData(healthData);

        describe("Simplified flow", async() => {
            it("signature stored", async() => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                validAbi = generateAbiMock({
                    public_key: publicKey,
                    hash: hash,
                    signature: signature,
                });

                const proof = await create_proof(prover, acir, validAbi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(true);

                // store the signature and assert it has been stored

                // prerequisite: the data provider that stores its signature is authorized
                // to do so thanks to its NFT
                await dataProvidersNFTsInstance.authorizeProvider(providerA);

                await factFortressInstance.storeSignature(publicKey, signature, {
                    from: providerA,
                });

                const signatureStored = await factFortressInstance.checkSignature(
                    publicKey,
                    signature
                );

                expect(signatureStored).eq(true);
            });

            it("signature not stored", async() => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                validAbi = generateAbiMock({
                    public_key: publicKey,
                    hash: hash,
                    signature: signature,
                });

                const proof = await create_proof(prover, acir, validAbi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(true);

                // assert the the signature has not been stored
                const signatureStored = await factFortressInstance.checkSignature(
                    publicKey,
                    signature
                );

                expect(signatureStored).eq(false);
            });

            it("valid proof of provenance", async() => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                await dataProvidersNFTsInstance.authorizeProvider(providerA);

                await factFortressInstance.storeSignature(publicKey, signature, {
                    from: providerA,
                });

                validAbi = generateAbiMock({
                    public_key: publicKey,
                    hash: hash,
                    signature: signature,
                });

                const proof = await create_proof(prover, acir, validAbi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(true);

                const publicKeyResult = await factFortressInstance.verifyPublicInputsPoP(
                    publicKey,
                    proof
                );
                expect(publicKeyResult).eq(true);

                const smartContractResult = await factFortressInstance.verifyProof(
                    "proof_of_provenance",
                    proof
                );
                expect(smartContractResult).eq(true);
            });

            it("invalid proof of provenance", async() => {
                const privateKey = randomBytes(32);
                const signature = helper.signHash(privateKey, hash);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);

                const abi = generateAbiMock({
                    public_key: publicKey,
                    hash: hash,
                    signature: signature,
                });

                // falsify the signature to make it invalid and fail the proof
                abi.signature[0] = (abi.signature[0] + 1) % 256;

                const proof = await create_proof(prover, acir, abi);
                const verified = await verify_proof(verifier, proof);

                expect(verified).eq(false);

                await expect(
                    factFortressInstance.verifyProof("proof_of_provenance", proof)
                ).to.be.rejectedWith(
                    "VM Exception while processing transaction: revert Proof failed"
                );
            });
        });

        describe("Complete flow", async() => {
            it("valid proof", async() => {
                // [DATA PROVIDER] ////////////////////////////////////////////////

                // Step 1. The data provider uploads its public key
                const name = "Provider C";

                // a) Mint a new ZKP token for the data provider
                await dataProvidersNFTsInstance.authorizeProvider(providerC);

                // b) Upload data provider's public key
                const privateKey = randomBytes(32);
                const publicKey = helper.getGrumpkinPublicKey(privateKey);
                await factFortressInstance.setPublicKey(name, publicKey, {
                    from: providerC,
                });

                // Step 2. Make the data provider sign the data
                const signature = helper.signHash(privateKey, hash);

                // Step 3. The data provider stores the signature on-chain
                await factFortressInstance.storeSignature(publicKey, signature, {
                    from: providerC,
                });

                // [DATA ANALYST] //////////////////////////////////////////////

                // Step 4. Data analyst gets the data provider's public key

                // a) Data shared with the data analyst
                const providerNameP = name; // communicated by the data provider
                const publicKeyVersionP = 0; // communicated by the data provider

                // b) Data fetched by the data analyst on-chain
                const providerPublicKeyP = await factFortressInstance.getPublicKey(
                    providerNameP,
                    publicKeyVersionP
                );

                // Step 5. Data analyst generates the proof off-chain

                // a) Data shared with the data analyst
                const providerHashP = hash; // communicated by the data provider
                const providerSignatureP = signature; // communicated by the data provider

                // b) Generation of the proof
                const abi = generateAbiMock({
                    public_key: providerPublicKeyP,
                    hash: providerHashP,
                    signature: providerSignatureP,
                });
                const proof = await create_proof(prover, acir, abi);

                // c) (sanity check) The data analyst verifies off-chain that the proof is valid
                const verified = await verify_proof(verifier, proof);
                expect(verified).eq(true);

                // [VERIFIER] ////////////////////////////////////////////////

                // Step 6. Verifier gets the proof and verifies the public key

                // a) Data shared with the verifier
                const providerNameV = name; // communicated by the data provider
                const publicKeyVersionV = 0; // communicated by the data provider
                const proofV = proof; // communicated by the data analyst (on-chain or off-chain?)

                // b) Data fetched by the verifier on the blockchain
                const providerPublicKeyV = await factFortressInstance.getPublicKey(
                    providerNameV,
                    publicKeyVersionV
                );

                // d) (Verification A)
                // The verifier ensures that the public key is the expected one
                // as well as the signature
                // (Note: this step can also be done off-chain if needed)
                const publicKeyMatch = await factFortressInstance.verifyPublicInputsPoP(
                    providerPublicKeyV,
                    proofV
                );
                expect(publicKeyMatch).eq(true);

                // e) (Verification B)
                // The verifier verifies the proof of provenance
                const proofVerified = await factFortressInstance.verifyProof(
                    "proof_of_provenance",
                    proofV
                );
                expect(proofVerified).eq(true);
            });
        });
    });
});