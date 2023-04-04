const ZkpToken = artifacts.require("ZkpToken");

module.exports = function(deployer) {
    deployer.deploy(ZkpToken);
};