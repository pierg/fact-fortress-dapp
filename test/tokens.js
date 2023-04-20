const ZkpHealthAuthorityToken = artifacts.require("ZkpHealthAuthorityToken");
const ZkpHealthResearcherToken = artifacts.require("ZkpHealthResearcherToken");

contract("ZkpHealthAuthorityToken", (accounts) => {
    let zkpHealthAuthorityToken;

    beforeEach(async() => {
        zkpHealthAuthorityToken = await ZkpHealthAuthorityToken.new();
    });

    it("should authorize an hospital", async() => {
        const tokenRecipient = accounts[9];

        // Mint a new token and get the ID
        const tokenId = await zkpHealthAuthorityToken.authorizeAuthority(tokenRecipient);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpHealthAuthorityToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), tokenRecipient);
    });
});

contract("should authorize a researcher", (accounts) => {
    let zkpHealthResearcherToken;

    const defaultPolicy = "default_policy";

    beforeEach(async() => {
        zkpHealthResearcherToken = await ZkpHealthResearcherToken.new();
    });

    it("should authorize a researcher", async() => {
        const tokenRecipient = accounts[9];

        const accessPolicies = [];

        // Mint a new token and get the ID
        const tokenId = await zkpHealthResearcherToken.authorizeResearcher(tokenRecipient, accessPolicies);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpHealthResearcherToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), tokenRecipient);
    });

    it("should get the list of access policies", async() => {
        // Check the default policy
        let allAccessTypes0 = await zkpHealthResearcherToken.getAllAccessTypes();

        expect(allAccessTypes0).to.have.deep.members([defaultPolicy]);

        // Mint a new token
        await zkpHealthResearcherToken.authorizeResearcher(accounts[9], ["TYPE_A", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        let allAccessTypes1 = await zkpHealthResearcherToken.getAllAccessTypes();

        expect(allAccessTypes1).to.have.deep.members([defaultPolicy, "TYPE_A", "TYPE_B", "TYPE_C"])

        // Mint a new token for a new researcher
        await zkpHealthResearcherToken.authorizeResearcher(accounts[8], ["TYPE_X", "TYPE_B", "TYPE_C"]);

        // Check that the list of access policies has been updated
        const allAccessTypes2 = await zkpHealthResearcherToken.getAllAccessTypes();

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

        const accessPolicies1 = await zkpHealthResearcherToken.getAccessTypes(researcherA);
        expect(accessPolicies1).to.have.deep.members(accessPoliciesA);

        // Researcher with a different set of access policies
        await zkpHealthResearcherToken.authorizeResearcher(researcherB, accessPoliciesB);

        const accessPolicies2 = await zkpHealthResearcherToken.getAccessTypes(researcherB);
        expect(accessPolicies2).to.have.deep.members(accessPoliciesB);

        // Researcher with no access policy (not authorized)
        const accessPolicies3 = await zkpHealthResearcherToken.getAccessTypes(researcherC);
        expect(accessPolicies3).to.have.deep.members([]);
    });
});