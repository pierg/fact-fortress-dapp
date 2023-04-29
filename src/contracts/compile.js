const fs = require('fs');
const { resolve } = require('path');
const solc = require('solc');

function getOpenZeppelinPath(filepath) {
    return resolve(__dirname, `../../node_modules/@openzeppelin/contracts/${filepath}`);
}
// @openzeppelin
const ERC721SourceCode = fs.readFileSync(getOpenZeppelinPath("/token/ERC721/ERC721.sol"));
const CountersSourceCode = fs.readFileSync(getOpenZeppelinPath("/utils/Counters.sol"));
const IERC721SourceCode = fs.readFileSync(getOpenZeppelinPath("/token/ERC721/IERC721.sol"));
const IERC721ReceiverSourceCode = fs.readFileSync(getOpenZeppelinPath("/token/ERC721/IERC721Receiver.sol"));
const IERC721MetadataSourceCode = fs.readFileSync(getOpenZeppelinPath("/token/ERC721/extensions/IERC721Metadata.sol"));
const AddressSourceCode = fs.readFileSync(getOpenZeppelinPath("/utils/Address.sol"));
const ContextSourceCode = fs.readFileSync(getOpenZeppelinPath("/utils/Context.sol"));
const StringsSourceCode = fs.readFileSync(getOpenZeppelinPath("/utils/Strings.sol"));
const ERC165SourceCode = fs.readFileSync(getOpenZeppelinPath("/utils/introspection/ERC165.sol"));
const IERC165SourceCode = fs.readFileSync(getOpenZeppelinPath("/utils/introspection/IERC165.sol"));
const MathSourceCode = fs.readFileSync(getOpenZeppelinPath("/utils/math/Math.sol"));

// core folder
const dataProvidersNFTsSourceCode = fs.readFileSync(resolve(__dirname, "../../contracts/dataProvidersNFTs.sol"));
const dataAnalystNFTsSourceCode = fs.readFileSync(resolve(__dirname, "../../contracts/dataAnalystsNFTs.sol"));
const verifierProvenanceSourceCode = fs.readFileSync(resolve(__dirname, "../../contracts/verifierProvenance.sol"));

const buildPath = resolve(__dirname, "./build");

function findImports(path) {
    if (path === "@openzeppelin/contracts/token/ERC721/ERC721.sol") return { contents: `${ERC721SourceCode}` };
    if (path === "@openzeppelin/contracts/utils/Counters.sol") return { contents: `${CountersSourceCode}` };
    if (path === "@openzeppelin/contracts/token/ERC721/IERC721.sol") return { contents: `${IERC721SourceCode}` };
    if (path === "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol") return { contents: `${IERC721ReceiverSourceCode}` };
    if (path === "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol") return { contents: `${IERC721MetadataSourceCode}` };
    if (path === "@openzeppelin/contracts/utils/Address.sol") return { contents: `${AddressSourceCode}` };
    if (path === "@openzeppelin/contracts/utils/Context.sol") return { contents: `${ContextSourceCode}` };
    if (path === "@openzeppelin/contracts/utils/Strings.sol") return { contents: `${StringsSourceCode}` };
    if (path === "@openzeppelin/contracts/utils/introspection/ERC165.sol") return { contents: `${ERC165SourceCode}` };
    if (path === "@openzeppelin/contracts/utils/introspection/IERC165.sol") return { contents: `${IERC165SourceCode}` };
    if (path === "@openzeppelin/contracts/utils/math/Math.sol") return { contents: `${MathSourceCode}` };
    if (path === "dataProvidersNFTs.sol") return { contents: `${dataProvidersNFTsSourceCode}` };
    if (path === "dataAnalystsNFTs.sol") return { contents: `${dataAnalystNFTsSourceCode}` };
    if (path === "verifierProvenance.sol") return { contents: `${verifierProvenanceSourceCode}` };
    else return { error: "File not found" };
}

function compile(contractFilename, contractName) {
    const contractPath = resolve(__dirname, "../../contracts/", contractFilename);
    const contractSourceCode = fs.readFileSync(contractPath, "utf8");

    if (!fs.existsSync(buildPath)) {
        fs.mkdirSync(buildPath);
    }

    var input = {
        language: "Solidity",
        sources: {
            Contract: {
                content: contractSourceCode
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            outputSelection: {
                "*": {
                    "*": ["*"]
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    for (let name in output.contracts.Contract) {
        fs.writeFile(resolve(buildPath, `${name}.json`),
            JSON.stringify(output.contracts.Contract[name], null, 2), err => {
                if (err) {
                    console.error(err);
                }
            });
    }

    return output.contracts.Contract[contractName];
}

module.exports = { compile };