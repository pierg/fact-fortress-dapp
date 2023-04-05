const ZkpToken = artifacts.require("ZkpToken");
const ZkpContract = artifacts.require("ZkpContract");

module.exports = function(deployer) {
    deployer.deploy(ZkpToken).then(function() {
        return deployer.deploy(ZkpContract, ZkpToken.address)
    });
};