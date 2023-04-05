const ZkpContract = artifacts.require('ZkpContract');
const ZkpToken = artifacts.require('ZkpToken');
const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect;

contract('ZkpContract', function(accounts) {
    const hospitalA = accounts[0];
    const hospitalB = accounts[1];

    let zkpTokenInstance;
    let zkpContractInstance;

    beforeEach(async() => {
        zkpTokenInstance = await ZkpToken.new();
        zkpContractInstance = await ZkpContract.new(zkpTokenInstance.address);
    });


    it("should allow an authorized hospital with a valid ZKP token to add their public key", async() => {
        // Mint a new ZKP token for hospitalA
        await zkpTokenInstance.mint(hospitalA);
        const tokenId = await zkpTokenInstance.userToToken(hospitalA);

        // Set hospitalA's public key
        const name = "Hospital A";
        const publicKey = "0xabc123";
        await zkpContractInstance.setPublicKey(tokenId, name, publicKey, { from: hospitalA });

        // Verify that hospitalA's public key was set correctly
        const retrievedPublicKey = await zkpContractInstance.getPublicKey(tokenId, name);
        assert.equal(retrievedPublicKey, publicKey, "Public key was not set correctly");
    });

    it("should allow an hospital to update their own public key", async() => {
        // Mint a new ZKP token for hospitalA
        await zkpTokenInstance.mint(hospitalA);
        const tokenId = await zkpTokenInstance.userToToken(hospitalA);

        // Set hospitalA's initial public key
        const initialName = "Hospital A";
        const initialPublicKey = "0xabc123";
        await zkpContractInstance.setPublicKey(tokenId, initialName, initialPublicKey, { from: hospitalA });

        // Update hospitalA's public key
        const updatedName = "Hospital A";
        const updatedPublicKey = "0xdef456";
        await zkpContractInstance.setPublicKey(tokenId, updatedName, updatedPublicKey, { from: hospitalA });

        // Verify that hospitalA's public key was updated correctly
        const retrievedPublicKey = await zkpContractInstance.getPublicKey(tokenId, updatedName);
        assert.equal(retrievedPublicKey, updatedPublicKey, "Public key was not updated correctly");
    });

    it("should not allow unauthorized hospital/user to set a public key", async() => {
        // Mint a new ZKP token for hospitalA
        await zkpTokenInstance.mint(hospitalA);
        const hospitalATokenId = await zkpTokenInstance.userToToken(hospitalA);

        // Try to set a public key for the third account using the second account's ZKP token
        await expect(zkpContractInstance.setPublicKey(hospitalATokenId, "Hospital A", "0xabc123", { from: hospitalB }))
            .to.be.rejectedWith("VM Exception while processing transaction: revert Caller is not approved or the owner of the corresponding ZKP token");

        // Verify that the public key was not set
        const publicKey = await zkpContractInstance.getPublicKey(hospitalATokenId, "test");
        assert.equal(publicKey, "");
    });

    it("should not allow setting a public key with an empty string", async() => {
        // Mint a new ZKP token for hospitalA
        await zkpTokenInstance.mint(hospitalA);
        const tokenId = await zkpTokenInstance.userToToken(hospitalA);

        // Try to set an empty public key for hospitalA
        const name = "Hospital A";
        await expect(zkpContractInstance.setPublicKey(tokenId, name, "", { from: hospitalA }))
            .to.be.rejectedWith("VM Exception while processing transaction: revert Public key cannot be empty");

        // Verify that the public key was not set
        const retrievedPublicKey = await zkpContractInstance.getPublicKey(tokenId, name);
        assert.equal(retrievedPublicKey, "");
    });

    it("should not allow an authorized hospital to modify another authorized hospital's public key with the same name", async() => {
        // Mint new ZKP tokens for hospitalA and hospitalB
        await zkpTokenInstance.mint(hospitalA);
        await zkpTokenInstance.mint(hospitalB);

        const hospitalATokenId = await zkpTokenInstance.userToToken(hospitalA);
        const hospitalBTokenId = await zkpTokenInstance.userToToken(hospitalB);

        // set public key for Hospital A's token and name "hospital A"
        await zkpContractInstance.setPublicKey(hospitalATokenId, "hospital A", "0x123");

        // set public key for Hospital A's token and name "hospital A" by hospitalB
        try {
            await zkpContractInstance.setPublicKey(hospitalBTokenId, "hospital A", "0x456", {
                from: hospitalB,
            });
        } catch (error) {
            assert.equal(
                error.reason,
                "You are not the owner of this token",
                "Should not allow an authorized hospital to modify another authorized hospital's public key with the same name"
            );
        }
    });

    it("should allow an authorized hospital to transfer their token and the new address to update their public key", async() => {
        const hospitalANewAddress = accounts[2];

        // Mint a new ZKP token for hospitalA
        await zkpTokenInstance.mint(hospitalA);
        const tokenId = await zkpTokenInstance.userToToken(hospitalA);

        // Set hospitalA's public key
        const name = "Hospital A";
        const publicKey = "0xabc123";
        await zkpContractInstance.setPublicKey(tokenId, name, publicKey, { from: hospitalA });

        // Transfer the token to the new address
        await zkpTokenInstance.transferFrom(hospitalA, hospitalANewAddress, tokenId, { from: hospitalA });

        // Set hospitalA's new public key with the new address
        const newPublicKey = "0xdef456";
        await zkpContractInstance.setPublicKey(tokenId, name, newPublicKey, { from: hospitalANewAddress });

        // Verify that hospitalA's new public key was set correctly
        const retrievedNewPublicKey = await zkpContractInstance.getPublicKey(tokenId, name);
        assert.equal(retrievedNewPublicKey, newPublicKey, "Public key was not set correctly");
    });
});