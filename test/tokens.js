const DataProvidersNFTs = artifacts.require("DataProvidersNFTs");
const DataAnalystsNFTs = artifacts.require("DataAnalystsNFTs");

const chai = require("chai").use(require("chai-as-promised"));
const expect = chai.expect;

contract("DataProvidersNFTs", (accounts) => {
    let dataProvidersNFTs;
    const owner = accounts[0];
    const provider = accounts[1];

    beforeEach(async() => {
        dataProvidersNFTs = await DataProvidersNFTs.new({ from: owner });
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

contract("DataAnalystsNFTs", (accounts) => {
    let dataAnalystsNFTs;
    let dataProvidersNFTs;

    const owner = accounts[0];
    const provider = accounts[1];
    const analyst = accounts[2];
    const analystB = accounts[3];
    const analystC = accounts[4];

    const default_policy = "default_policy";
    const allPolicies = ["TYPE_A", "TYPE_B", "TYPE_C", "TYPE_X"];

    beforeEach(async() => {
        dataProvidersNFTs = await DataProvidersNFTs.new({ from: owner });
        dataAnalystsNFTs = await DataAnalystsNFTs.new(dataProvidersNFTs.address, { from: owner });
        await dataAnalystsNFTs.setAllAccessPolicies(allPolicies);
    });

    it("should authorize a data analyst (by owner)", async() => {
        const accessPolicies = [];

        // Mint a new token and get the ID _as owner (implicit)_
        const tokenId = await dataAnalystsNFTs.authorizeAnalyst(
            analyst,
            accessPolicies, { from: owner }
        );

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataAnalystsNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), analyst);
    });

    it("should authorize a data analyst (by data provider)", async() => {
        const accessPolicies = [];

        // A data provider has to be authorized beforehand
        await dataProvidersNFTs.authorizeProvider(provider);

        // Mint a new token and get the ID _as data provider_
        const tokenId = await dataAnalystsNFTs.authorizeAnalyst(
            analyst,
            accessPolicies, { from: provider }
        );

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataAnalystsNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), analyst);
    });

    it("should not authorize a data analyst (by unauthorized entity)", async() => {
        const accessPolicies = [];

        // Try to mint a new token without being authorized to do so
        await expect(
            dataAnalystsNFTs.authorizeAnalyst(
                analyst,
                accessPolicies, { from: analyst }
            )
        ).to.be.rejectedWith(
            "VM Exception while processing transaction: revert Caller is not the owner nor a data provider -- Reason given: Caller is not the owner nor a data provider"
        );
    });

    it("should get the list of access policies", async() => {
        // Check the default policy
        let allAccessPolicies = await dataAnalystsNFTs.getAllAccessPolicies();

        expect(allAccessPolicies).to.have.deep.members([default_policy, ...allPolicies]);
    });

    it("should get respective access policies", async() => {
        const accessPoliciesA = ["TYPE_A", "TYPE_B", "TYPE_C"];
        const accessPoliciesB = ["TYPE_X", "TYPE_B", "TYPE_C"];

        // Data analyst with a set of access policy
        await dataAnalystsNFTs.authorizeAnalyst(analyst, accessPoliciesA);

        const accessPolicies1 = await dataAnalystsNFTs.getAccessPolicies(analyst);
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
        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        let tokenId = await dataAnalystsNFTs.authorizeAnalyst(analyst, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await dataAnalystsNFTs.ownerOf(tokenId.receipt.logs[0].args.tokenId), analyst);

        // Unauthorize the data analyst
        await dataAnalystsNFTs.unauthorizeAnalyst(analyst);

        // Check that her token has been resetted
        token = await dataAnalystsNFTs.userToToken(analyst);

        assert.equal(token.tokenId, 0);

        // Check that her access policies have been resetted
        expect(await dataAnalystsNFTs.getAccessPolicies(analyst)).to.have.deep.members([]);
    });

    it("should reset all policies", async() => {
        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        await dataAnalystsNFTs.authorizeAnalyst(analyst, accessPolicies);

        // Check all access policies
        expect(await dataAnalystsNFTs.getAllAccessPolicies())
            .to.have.deep.members([default_policy, ...allPolicies]);

        // Reset all policies
        await dataAnalystsNFTs.removeAllAccessPolicies();

        // Ensure that policies are not set to default
        expect(await dataAnalystsNFTs.getAllAccessPolicies())
            .to.have.deep.members([default_policy]);
    });
});