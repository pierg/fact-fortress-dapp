const DataProvidersNFTs = artifacts.require("DataProvidersNFTs");
const DataAnalystsNFTs = artifacts.require("DataAnalystsNFTs");

contract("DataProvidersNFTs", (accounts) => {
    let dataProvidersNFTs;
    const provider = accounts[9];

    beforeEach(async() => {
        dataProvidersNFTs = await DataProvidersNFTs.new();
    });

    it("should authorize a data provider", async() => {
        // Mint a new token and get the ID
        const tokenId = await dataProvidersNFTs.authorizeProvider(provider);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataProvidersNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), provider);
    });

    it("should unauthorize a data provider", async() => {
        // Mint a new token
        await dataProvidersNFTs.authorizeProvider(provider);

        // Check that the token was minted and assigned to the correct address
        let tokenId = await dataProvidersNFTs.userToToken(provider);
        assert.equal(tokenId, 1);

        await dataProvidersNFTs.unauthorizeProvider(provider);

        // Check that the token was minted and assigned to the correct address
        tokenId = await dataProvidersNFTs.userToToken(provider);

        assert.equal(tokenId, 0);
    });
});

contract("should authorize a data analyst", (accounts) => {
    let dataAnalystsNFTs;

    const defaultPolicy = "default_policy";

    beforeEach(async() => {
        dataAnalystsNFTs = await DataAnalystsNFTs.new();
    });

    it("should authorize a data analyst", async() => {
        const analyst = accounts[9];

        const accessPolicies = [];

        // Mint a new token and get the ID
        const tokenId = await dataAnalystsNFTs.authorizeAnalyst(analyst, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataAnalystsNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), analyst);
    });

    it("should get the list of access policies", async() => {
        // Check the default policy
        let allAccessTypes0 = await dataAnalystsNFTs.getAllAccessPolicies();

        expect(allAccessTypes0).to.have.deep.members([defaultPolicy]);

        // Mint a new token
        await dataAnalystsNFTs.authorizeAnalyst(accounts[9], ["TYPE_A", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        let allAccessTypes1 = await dataAnalystsNFTs.getAllAccessPolicies();

        expect(allAccessTypes1).to.have.deep.members([defaultPolicy, "TYPE_A", "TYPE_B", "TYPE_C"])

        // Mint a new token for a new data analyst
        await dataAnalystsNFTs.authorizeAnalyst(accounts[8], ["TYPE_X", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        const allAccessTypes2 = await dataAnalystsNFTs.getAllAccessPolicies();

        expect(allAccessTypes2).to.have.deep.members([defaultPolicy, "TYPE_A", "TYPE_B", "TYPE_C", "TYPE_X"]);
    });

    it("should get respective access policies", async() => {
        const analystA = accounts[7];
        const analystB = accounts[6];
        const analystC = accounts[5];

        const accessPoliciesA = ["TYPE_A", "TYPE_B", "TYPE_C"];
        const accessPoliciesB = ["TYPE_X", "TYPE_B", "TYPE_C"];

        // Data analyst with a set of access policy
        await dataAnalystsNFTs.authorizeAnalyst(analystA, accessPoliciesA);

        const accessPolicies1 = await dataAnalystsNFTs.getAccessPolicies(analystA);
        expect(accessPolicies1).to.have.deep.members(accessPoliciesA);

        // Data analyst with a different set of access policies
        await dataAnalystsNFTs.authorizeAnalyst(analystB, accessPoliciesB);

        const accessPolicies2 = await dataAnalystsNFTs.getAccessPolicies(analystB);
        expect(accessPolicies2).to.have.deep.members(accessPoliciesB);

        // Data analyst with no access policy (not authorized)
        const accessPolicies3 = await dataAnalystsNFTs.getAccessPolicies(analystC);
        expect(accessPolicies3).to.have.deep.members([]);
    });

    it("should unauthorize a data analyst", async() => {
        const analyst = accounts[9];

        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        let tokenId = await dataAnalystsNFTs.authorizeAnalyst(analyst, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataAnalystsNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), analyst);

        // Unauthorize the data analyst
        await dataAnalystsNFTs.unauthorizeAnalyst(analyst);

        // Check that her token has been resetted
        token = await dataAnalystsNFTs.userToToken(analyst);

        assert.equal(token._tokenId, 0);

        // Check that her access policies have been resetted
        expect(await dataAnalystsNFTs.getAccessPolicies(analyst)).to.have.deep.members([]);
    });

    it("should reset all policies", async() => {
        const tokenRecipient = accounts[9];

        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        await dataAnalystsNFTs.authorizeAnalyst(tokenRecipient, accessPolicies);

        // Check all access policies
        expect(await dataAnalystsNFTs.getAllAccessPolicies())
            .to.have.deep.members([defaultPolicy, ...accessPolicies]);

        // Reset all policies
        await dataAnalystsNFTs.removeAllAccessPolicies();

        // Ensure that policies are not set to default
        expect(await dataAnalystsNFTs.getAllAccessPolicies())
            .to.have.deep.members([defaultPolicy]);
    });
});