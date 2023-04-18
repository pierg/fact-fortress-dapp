const ZkpHealthToken = artifacts.require("ZkpHealthToken");
const ZkpHealthVerifier = artifacts.require("ZkpHealthVerifier");
const ZkpHealth = artifacts.require("ZkpHealth");

module.exports = function(deployer) {
    deployer.deploy(ZkpHealthToken).then(function() {
        deployer.deploy(ZkpHealthVerifier).then(function() {
            return deployer.deploy(ZkpHealth, ZkpHealthToken.address, ZkpHealthVerifier.address)
        });
    });
};