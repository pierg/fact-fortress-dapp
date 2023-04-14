const ZkpToken = artifacts.require("ZkpToken");
const ZkpContract = artifacts.require("ZkpContract");
const ZkpVerifier = artifacts.require("ZkpVerifier");

module.exports = function(deployer) {
    deployer.deploy(ZkpToken).then(function() {
        deployer.deploy(ZkpVerifier).then(function() {
            return deployer.deploy(ZkpContract, ZkpToken.address, ZkpVerifier.address)
        });
    });
};