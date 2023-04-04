const ZkpContract = artifacts.require("ZkpContract");

module.exports = function(deployer) {
    deployer.deploy(ZkpContract);
};