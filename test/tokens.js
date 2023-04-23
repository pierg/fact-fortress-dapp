const DataProvidersNFTs = artifacts.require("DataProvidersNFTs");
const DataAnalyzersNFTs = artifacts.require("DataAnalyzersNFTs");

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

contract("should authorize a data analyzer", (accounts) => {
    let dataAnalyzersNFTs;

    const defaultPolicy = "default_policy";

    beforeEach(async() => {
        dataAnalyzersNFTs = await DataAnalyzersNFTs.new();
    });

    it("should authorize a data analyzer", async() => {
        const analyzer = accounts[9];

        const accessPolicies = [];

        // Mint a new token and get the ID
        const tokenId = await dataAnalyzersNFTs.authorizeAnalyzer(analyzer, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataAnalyzersNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), analyzer);
    });

    it("should get the list of access policies", async() => {
        // Check the default policy
        let allAccessTypes0 = await dataAnalyzersNFTs.getAllAccessPolicies();

        expect(allAccessTypes0).to.have.deep.members([defaultPolicy]);

        // Mint a new token
        await dataAnalyzersNFTs.authorizeAnalyzer(accounts[9], ["TYPE_A", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        let allAccessTypes1 = await dataAnalyzersNFTs.getAllAccessPolicies();

        expect(allAccessTypes1).to.have.deep.members([defaultPolicy, "TYPE_A", "TYPE_B", "TYPE_C"])

        // Mint a new token for a new data analyzer
        await dataAnalyzersNFTs.authorizeAnalyzer(accounts[8], ["TYPE_X", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        const allAccessTypes2 = await dataAnalyzersNFTs.getAllAccessPolicies();

        expect(allAccessTypes2).to.have.deep.members([defaultPolicy, "TYPE_A", "TYPE_B", "TYPE_C", "TYPE_X"]);
    });

    it("should get respective access policies", async() => {
        const analyzerA = accounts[7];
        const analyzerB = accounts[6];
        const analyzerC = accounts[5];

        const accessPoliciesA = ["TYPE_A", "TYPE_B", "TYPE_C"];
        const accessPoliciesB = ["TYPE_X", "TYPE_B", "TYPE_C"];

        // Data analyzer with a set of access policy
        await dataAnalyzersNFTs.authorizeAnalyzer(analyzerA, accessPoliciesA);

        const accessPolicies1 = await dataAnalyzersNFTs.getAccessPolicies(analyzerA);
        expect(accessPolicies1).to.have.deep.members(accessPoliciesA);

        // Data analyzer with a different set of access policies
        await dataAnalyzersNFTs.authorizeAnalyzer(analyzerB, accessPoliciesB);

        const accessPolicies2 = await dataAnalyzersNFTs.getAccessPolicies(analyzerB);
        expect(accessPolicies2).to.have.deep.members(accessPoliciesB);

        // Data analyzer with no access policy (not authorized)
        const accessPolicies3 = await dataAnalyzersNFTs.getAccessPolicies(analyzerC);
        expect(accessPolicies3).to.have.deep.members([]);
    });

    it("should unauthorize a data analyzer", async() => {
        const analyzer = accounts[9];

        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        let tokenId = await dataAnalyzersNFTs.authorizeAnalyzer(analyzer, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataAnalyzersNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), analyzer);

        // Unauthorize the data analyzer
        await dataAnalyzersNFTs.unauthorizeAnalyzer(analyzer);

        // Check that her token has been resetted
        token = await dataAnalyzersNFTs.userToToken(analyzer);

        assert.equal(token._tokenId, 0);

        // Check that her access policies have been resetted
        expect(await dataAnalyzersNFTs.getAccessPolicies(analyzer)).to.have.deep.members([]);
    });

    it("should reset all policies", async() => {
        const tokenRecipient = accounts[9];

        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        await dataAnalyzersNFTs.authorizeAnalyzer(tokenRecipient, accessPolicies);

        // Check all access policies
        expect(await dataAnalyzersNFTs.getAllAccessPolicies())
            .to.have.deep.members([defaultPolicy, ...accessPolicies]);

        // Reset all policies
        await dataAnalyzersNFTs.removeAllAccessPolicies();

        // Ensure that policies are not set to default
        expect(await dataAnalyzersNFTs.getAllAccessPolicies())
            .to.have.deep.members([defaultPolicy]);
    });
});