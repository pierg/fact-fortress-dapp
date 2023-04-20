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

    beforeEach(async() => {
        zkpHealthResearcherToken = await ZkpHealthResearcherToken.new();
    });

    it("should authorize a researcher", async() => {
        const tokenRecipient = accounts[9];

        const accessTypes = ["TYPE_A", "TYPE_B", "TYPE_C"];

        // Mint a new token and get the ID
        const tokenId = await zkpHealthResearcherToken.authorizeResearcher(tokenRecipient, accessTypes);

        // Check that the token was minted and assigned to the correct address
        assert.equal(await zkpHealthResearcherToken.ownerOf(tokenId.receipt.logs[0].args.tokenId), tokenRecipient);
    });

    it("should get the list of access types", async() => {
        // Mint a new token
        await zkpHealthResearcherToken.authorizeResearcher(accounts[9], ["TYPE_A", "TYPE_B", "TYPE_C"]);

        // Check that the list of access types has been updated
        let allAccessTypes1 = await zkpHealthResearcherToken.getAllAccessTypes();

        expect(allAccessTypes1).to.have.deep.members(["TYPE_A", "TYPE_B", "TYPE_C"])

        // Mint a new token for a new researcher
        await zkpHealthResearcherToken.authorizeResearcher(accounts[8], ["TYPE_X", "TYPE_B", "TYPE_C"]);

        // Check that the list of access types has been updated
        const allAccessTypes2 = await zkpHealthResearcherToken.getAllAccessTypes();

        expect(allAccessTypes2).to.have.deep.members(["TYPE_A", "TYPE_B", "TYPE_C", "TYPE_X"]);
    });

    it("should get respective access types", async() => {
        const researcherA = accounts[7];
        const researcherB = accounts[6];
        const researcherC = accounts[5];

        const accessTypesA = ["TYPE_A", "TYPE_B", "TYPE_C"];
        const accessTypesB = ["TYPE_X", "TYPE_B", "TYPE_C"];

        // Researcher with a set of access type
        await zkpHealthResearcherToken.authorizeResearcher(researcherA, accessTypesA);

        const accessTypes1 = await zkpHealthResearcherToken.getAccessTypes(researcherA);
        expect(accessTypes1).to.have.deep.members(accessTypesA);

        // Researcher with a different set of access types
        await zkpHealthResearcherToken.authorizeResearcher(researcherB, accessTypesB);

        const accessTypes2 = await zkpHealthResearcherToken.getAccessTypes(researcherB);
        expect(accessTypes2).to.have.deep.members(accessTypesB);

        // Researcher with no access type (not authorized)
        const accessTypes3 = await zkpHealthResearcherToken.getAccessTypes(researcherC);
        expect(accessTypes3).to.have.deep.members([]);
    });
});