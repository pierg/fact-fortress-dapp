const DataProvidersNFTs = artifacts.require("DataProvidersNFTs");
const DataAnalyzersNFTs = artifacts.require("DataAnalyzersNFTs");
const VerifierProvenance = artifacts.require("VerifierProvenance");
const FactFortress = artifacts.require("FactFortress");

module.exports = function(deployer) {
    deployer.deploy(DataProvidersNFTs).then(function() {
        deployer.deploy(DataAnalyzersNFTs).then(function() {
            deployer.deploy(VerifierProvenance).then(function() {
                return deployer.deploy(
                    FactFortress,
                    DataProvidersNFTs.address,
                    DataAnalyzersNFTs.address,
                    VerifierProvenance.address,
                )
            });
        });
    });
};