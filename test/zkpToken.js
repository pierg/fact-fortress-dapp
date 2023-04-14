// Import the smart contract
const ZkpToken = artifacts.require("ZkpToken");

contract("ZkpToken", (accounts) => {
    let zkpToken;

    beforeEach(async() => {
        zkpToken = await ZkpToken.new();
    });

    it("should mint a new token", async() => {
        // Mint a new token and get the ID
        const tokenId = await zkpToken.mint(accounts[0]);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), accounts[0]);
    });
});