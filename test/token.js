const ZkpHealthToken = artifacts.require("ZkpHealthToken");

contract("ZkpHealthToken", (accounts) => {
    let zkpHealthToken;

    beforeEach(async() => {
        zkpHealthToken = await ZkpHealthToken.new();
    });

    it("should mint a new token", async() => {
        const tokenRecipient = accounts[9];

        // Mint a new token and get the ID
        const tokenId = await zkpHealthToken.mint(tokenRecipient);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpHealthToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), tokenRecipient);
    });
});