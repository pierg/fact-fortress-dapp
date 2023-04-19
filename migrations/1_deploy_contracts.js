const ZkpHealthAuthorityToken = artifacts.require("ZkpHealthAuthorityToken");
const ZkpHealthResearcherToken = artifacts.require("ZkpHealthResearcherToken");
const ZkpHealthVerifier = artifacts.require("ZkpHealthVerifier");
const ZkpHealth = artifacts.require("ZkpHealth");

module.exports = function(deployer) {
    deployer.deploy(ZkpHealthAuthorityToken).then(function() {
        deployer.deploy(ZkpHealthResearcherToken).then(function() {
            deployer.deploy(ZkpHealthVerifier).then(function() {
                return deployer.deploy(
                    ZkpHealth,
                    ZkpHealthAuthorityToken.address,
                    ZkpHealthResearcherToken.address,
                    ZkpHealthVerifier.address,
                )
            });
        });
    });
};