const DataProvidersNFTs = artifacts.require("DataProvidersNFTs");
const DataAnalystsNFTs = artifacts.require("DataAnalystsNFTs");
const VerifierProvenance = artifacts.require("VerifierProvenance");
const FactFortress = artifacts.require("FactFortress");

module.exports = function(deployer) {
    deployer.deploy(DataProvidersNFTs).then(function() {
        deployer.deploy(DataAnalystsNFTs, DataProvidersNFTs.address).then(function() {
            deployer.deploy(VerifierProvenance).then(function() {
                return deployer.deploy(
                    FactFortress,
                    DataProvidersNFTs.address,
                    DataAnalystsNFTs.address,
                    VerifierProvenance.address,
                )
            });
        });
    });
};