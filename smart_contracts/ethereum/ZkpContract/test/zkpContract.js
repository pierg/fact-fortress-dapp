const ZkpContract = artifacts.require('ZkpContract');
const chai = require('chai').use(require('chai-as-promised'))
const expect = chai.expect;

contract('ZkpContract', function(accounts) {
    let zkpContract;
    const owner = accounts[0];
    const hospitalA = accounts[1];
    const hospitalB = accounts[2];
    const unauthorized = accounts[3];

    beforeEach(async function() {
        zkpContract = await ZkpContract.deployed();
    });

    it('should allow the owner to authorize an hospital', async function() {
        await zkpContract.authorizeUser(hospitalA, { from: owner });
        const isAuthorized = await zkpContract.isUserAuthorized(hospitalA);
        expect(isAuthorized).to.be.true;
    });

    it('should allow the owner to revoke authorization', async function() {
        await zkpContract.revokeUser(hospitalA, { from: owner });
        const isAuthorized = await zkpContract.isUserAuthorized(hospitalA);
        expect(isAuthorized).to.be.false;
    });

    it('should allow an authorized hospital to set its public key', async function() {
        const name = 'hospitalB';
        const publicKey = '0x123456789abcdef';
        await zkpContract.authorizeUser(hospitalB, { from: owner });
        await zkpContract.setPublicKey(name, publicKey, { from: hospitalB });
        const storedPublicKey = await zkpContract.publicKeys(hospitalB, name);
        expect(storedPublicKey).to.equal(publicKey);
    });

    it('should not allow an unauthorized hospital to set a public key', async function() {
        const name = 'hospitalA';
        const publicKey = '0x123456789abcdef';
        await expect(zkpContract.setPublicKey(name, publicKey, { from: unauthorized }))
            .to.be.rejectedWith('VM Exception while processing transaction: revert Caller is not authorized to change this public key');;
    });

    it('should return the correct public key for a given hospital name', async function() {
        const name = 'hospitalA';
        const publicKey = '0x123456789abcdef';
        await zkpContract.authorizeUser(hospitalA, { from: owner });
        await zkpContract.setPublicKey(name, publicKey, { from: hospitalA });
        const storedPublicKey = await zkpContract.getPublicKey(hospitalA, name);
        expect(storedPublicKey).to.equal(publicKey);
    });
});