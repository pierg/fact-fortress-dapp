const ZkpHealthAuthorityToken = artifacts.require("ZkpHealthAuthorityToken");
const ZkpHealthResearcherToken = artifacts.require("ZkpHealthResearcherToken");

contract("ZkpHealthAuthorityToken", (accounts) => {
    let zkpHealthAuthorityToken;
    const hospital = accounts[9];

    beforeEach(async() => {
        zkpHealthAuthorityToken = await ZkpHealthAuthorityToken.new();
    });

    it("should authorize an hospital", async() => {
        // Mint a new token and get the ID
        const tokenId = await zkpHealthAuthorityToken.authorizeAuthority(hospital);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpHealthAuthorityToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), hospital);
    });

    it("should unauthorize an hospital", async() => {
        // Mint a new token
        await zkpHealthAuthorityToken.authorizeAuthority(hospital);

        // Check that the token was minted and assigned to the correct address
        let tokenId = await zkpHealthAuthorityToken.userToToken(hospital);
        assert.equal(tokenId, 1);

        await zkpHealthAuthorityToken.unauthorizeAuthority(hospital);

        // Check that the token was minted and assigned to the correct address
        tokenId = await zkpHealthAuthorityToken.userToToken(hospital);

        assert.equal(tokenId, 0);
    });
});

contract("should authorize a researcher", (accounts) => {
    let zkpHealthResearcherToken;

    const defaultPolicy = "default_policy";

    beforeEach(async() => {
        zkpHealthResearcherToken = await ZkpHealthResearcherToken.new();
    });

    it("should authorize a researcher", async() => {
        const researcher = accounts[9];

        const accessPolicies = [];

        // Mint a new token and get the ID
        const tokenId = await zkpHealthResearcherToken.authorizeResearcher(researcher, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpHealthResearcherToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), researcher);
    });

    it("should get the list of access policies", async() => {
        // Check the default policy
        let allAccessTypes0 = await zkpHealthResearcherToken.getAllAccessPolicies();

        expect(allAccessTypes0).to.have.deep.members([defaultPolicy]);

        // Mint a new token
        await zkpHealthResearcherToken.authorizeResearcher(accounts[9], ["TYPE_A", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        let allAccessTypes1 = await zkpHealthResearcherToken.getAllAccessPolicies();

        expect(allAccessTypes1).to.have.deep.members([defaultPolicy, "TYPE_A", "TYPE_B", "TYPE_C"])

        // Mint a new token for a new researcher
        await zkpHealthResearcherToken.authorizeResearcher(accounts[8], ["TYPE_X", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        const allAccessTypes2 = await zkpHealthResearcherToken.getAllAccessPolicies();

        expect(allAccessTypes2).to.have.deep.members([defaultPolicy, "TYPE_A", "TYPE_B", "TYPE_C", "TYPE_X"]);
    });

    it("should get respective access policies", async() => {
        const researcherA = accounts[7];
        const researcherB = accounts[6];
        const researcherC = accounts[5];

        const accessPoliciesA = ["TYPE_A", "TYPE_B", "TYPE_C"];
        const accessPoliciesB = ["TYPE_X", "TYPE_B", "TYPE_C"];

        // Researcher with a set of access policy
        await zkpHealthResearcherToken.authorizeResearcher(researcherA, accessPoliciesA);

        const accessPolicies1 = await zkpHealthResearcherToken.getAccessPolicies(researcherA);
        expect(accessPolicies1).to.have.deep.members(accessPoliciesA);

        // Researcher with a different set of access policies
        await zkpHealthResearcherToken.authorizeResearcher(researcherB, accessPoliciesB);

        const accessPolicies2 = await zkpHealthResearcherToken.getAccessPolicies(researcherB);
        expect(accessPolicies2).to.have.deep.members(accessPoliciesB);

        // Researcher with no access policy (not authorized)
        const accessPolicies3 = await zkpHealthResearcherToken.getAccessPolicies(researcherC);
        expect(accessPolicies3).to.have.deep.members([]);
    });

    it("should unauthorize a researcher", async() => {
        const researcher = accounts[9];

        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        let tokenId = await zkpHealthResearcherToken.authorizeResearcher(researcher, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpHealthResearcherToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), researcher);

        // Unauthorize the researcher
        await zkpHealthResearcherToken.unauthorizeResearcher(researcher);

        // Check that her token has been resetted
        token = await zkpHealthResearcherToken.userToToken(researcher);

        assert.equal(token._tokenId, 0);

        // Check that her access policies have been resetted
        expect(await zkpHealthResearcherToken.getAccessPolicies(researcher)).to.have.deep.members([]);
    });

    it("should reset all policies", async() => {
        const tokenRecipient = accounts[9];

        const accessPolicies = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        await zkpHealthResearcherToken.authorizeResearcher(tokenRecipient, accessPolicies);

        // Check all access policies
        expect(await zkpHealthResearcherToken.getAllAccessPolicies())
            .to.have.deep.members([defaultPolicy, ...accessPolicies]);

        // Reset all policies
        await zkpHealthResearcherToken.removeAllAccessPolicies();

        // Ensure that policies are not set to default
        expect(await zkpHealthResearcherToken.getAllAccessPolicies())
            .to.have.deep.members([defaultPolicy]);
    });
});