// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.1;

import "./dataProvidersNFTs.sol";
import "./dataAnalystsNFTs.sol";
import "./verifierProvenance.sol";

contract Verifier {
    function verify(bytes calldata) external view returns (bool result) {}
}

// This contract manages the data provider's public keys and verifies, directly and indirectly
// (by calling the proof of provenance verifier contracts), the zero-knowledge proofs
contract FactFortress {
    address private _owner;
    DataProvidersNFTs private _dataProvidersNFTs;
    DataAnalystsNFTs private _dataAnalystsNFTs;
    VerifierProvenance private _verifierProvenance;

    // Public keys
    event PublicKeyVersion(uint);

    // name => list of public keys
    mapping(string => string[]) public publicKeys;
    string[] publicKeyEntries;

    // name => token ID
    // (used to prevent a data provider to associate its public key
    // with a name that is not its own)
    mapping(string => uint256) private _tokenIds;

    // Data Access

    // TODO(Guillaume): to improve (for demo purposes)
    struct DataSource {
        string url;
        string credentials;
        string[] accessPolicies;
    }

    // data id => { url, credentials, access policies }
    mapping(string => DataSource) private _dataSource;

    // Signatures: hash(signature) => hash(public key)
    mapping(bytes32 => bytes32) private _signatures;

    // Verifiers: statement function => verifier address
    mapping(string => address) private _verifiers;

    constructor(
        address dataProvidersNFTsAddress,
        address dataAnalystsNFTsAddress,
        address VerifierProvenanceAddress
    ) {
        _owner = msg.sender;
        _dataProvidersNFTs = DataProvidersNFTs(dataProvidersNFTsAddress);
        _dataAnalystsNFTs = DataAnalystsNFTs(dataAnalystsNFTsAddress);
        _verifierProvenance = VerifierProvenance(VerifierProvenanceAddress);

        _verifiers["proof_of_provenance"] = VerifierProvenanceAddress;
    }

    // PUBLIC KEYS MANAGEMENT

    function getPublicKey(
        string memory name,
        uint version
    ) external view returns (string memory) {
        require(version < publicKeys[name].length, "Public key does not exist");
        return publicKeys[name][version];
    }

    function getLatestPublicKey(
        string memory name
    ) external view returns (string memory) {
        require(
            publicKeys[name].length > 0,
            "Public key does not exist for this token ID and name"
        );
        uint lastIndex = publicKeys[name].length - 1;
        return publicKeys[name][lastIndex];
    }

    function setPublicKey(
        string memory name,
        string memory publicKey
    ) external returns (uint) {
        // guard clauses
        // 1) public key cannot be empty (TODO: ensure it is valid)
        // 2) caller of the function has to own an NFT
        require(bytes(publicKey).length != 0, "Public key cannot be empty");
        uint256 tokenId = _dataProvidersNFTs.userToToken(msg.sender);
        require(tokenId > 0, "Caller is not authorized to set a public key");

        if (publicKeys[name].length > 0) {
            // 3) if the name is already used, only the data provider which
            //    used it first can upload a new public key associated
            //    with this name
            require(
                tokenId == _tokenIds[name],
                "Caller is not authorized to update the public key"
            );
        } else {
            // associate the name with the token ID
            _tokenIds[name] = tokenId;
            publicKeyEntries.push(name);
        }

        publicKeys[name].push(publicKey);

        uint version = publicKeys[name].length - 1;
        emit PublicKeyVersion(version);
        return version;
    }

    // TODO(Guillaume): improve this implementation (for demonstration purposes)
    function removeAllPublicKeys() external {
        require(
            msg.sender == _owner,
            "Caller is not authorized to remove all public keys"
        );

        for (uint256 i = 0; i < publicKeyEntries.length; i++) {
            delete publicKeys[publicKeyEntries[i]];
        }

        delete publicKeyEntries;
    }

    // DATA ACCESS MANAGEMENT

    function getDataSource(
        string memory dataId
    ) external view returns (DataSource memory) {
        require(
            _dataAnalystsNFTs.userToToken(msg.sender).tokenId > 0,
            "Caller is not authorized to get a data source (no data analyst token)"
        );

        string[] memory analystAccessPolicies = _dataAnalystsNFTs
            .getAccessPolicies(msg.sender);

        // check access policies
        // TODO(Guillaume): improve this implementation (for demo purposes)
        for (
            uint256 i = 0;
            i < _dataSource[dataId].accessPolicies.length;
            i++
        ) {
            for (uint256 j = 0; j < analystAccessPolicies.length; j++) {
                if (
                    keccak256(
                        abi.encodePacked(_dataSource[dataId].accessPolicies[i])
                    ) == keccak256(abi.encodePacked(analystAccessPolicies[j]))
                ) {
                    return _dataSource[dataId];
                }
            }
        }

        revert(
            "Not authorized to access the data source (access policy error)"
        );
    }

    function setDataSource(
        string memory dataId,
        string memory url,
        string memory credentials,
        string[] memory accessPolicies
    ) external {
        require(
            _dataProvidersNFTs.userToToken(msg.sender) > 0,
            "Caller is not authorized to set a data source"
        );

        _dataSource[dataId] = DataSource(url, credentials, accessPolicies);
    }

    // ZKP PROOF VERIFICATION

    // public key `x` and `y`
    struct PublicKeyPoints {
        bytes x;
        bytes y;
    }

    // extract the public key points `x` and `y` from the public key
    function getPublicKeyPoints(
        bytes calldata publicKey
    ) internal pure returns (PublicKeyPoints memory) {
        // `x` is at position [O, 32) in the public key
        bytes calldata publicKeyX = publicKey[0:32];
        // `y` is at position [32, 64) in the public key
        bytes calldata publicKeyY = publicKey[32:64];

        return PublicKeyPoints(publicKeyX, publicKeyY);
    }

    // store a signature as a keccak256 hash
    function storeSignature(
        bytes calldata publicKey,
        bytes calldata signature
    ) external {
        require(
            _dataProvidersNFTs.userToToken(msg.sender) > 0,
            "Caller is not authorized to store a signature"
        );

        PublicKeyPoints memory points = getPublicKeyPoints(publicKey);

        _signatures[keccak256(signature)] = keccak256(
            abi.encodePacked(points.x, points.y)
        );
    }

    // check whether a signature has been stored or not
    function checkSignature(
        bytes calldata publicKey,
        bytes calldata signature
    ) external view returns (bool) {
        PublicKeyPoints memory points = getPublicKeyPoints(publicKey);

        return
            _signatures[keccak256(signature)] ==
            keccak256(abi.encodePacked(points.x, points.y));
    }

    // Proof of Provenance (PoP)

    // PoP: extraction of public inputs
    // (Note: this operation has to be performed due to a current limitation
    //        of Noir: verifier smart contracts autogenerated by Noir do not
    //        accept public inputs as parameters to their verify function)

    // public inputs of the proof of provenance (PoP) proof
    // (public key points and signature)
    struct PublicInputsPoP {
        PublicKeyPoints publicKeyPoints;
        bytes signature;
    }

    // extract the public inputs embedded in the PoP proof
    function extractPublicInputsPoP(
        bytes calldata proof
    ) internal pure returns (PublicInputsPoP memory) {
        bytes memory signature = new bytes(64);
        uint filteredIndex = 0;
        for (uint i = 95; i < 2112; i += 32) {
            signature[filteredIndex] = proof[i];
            filteredIndex++;
        }

        // Public key x is at position [0:32)
        // Public key y is at position [32:64)
        // Signature is at position [95:2112) mod 32 (see above)
        return
            PublicInputsPoP(
                PublicKeyPoints(proof[0:32], proof[32:64]),
                signature
            );
    }

    // verify the public inputs of the PoP proof
    function verifyPublicInputsPoP(
        bytes calldata publicKey,
        bytes calldata proof
    ) external view returns (bool) {
        // extract public key from proof
        PublicInputsPoP memory publicInputs = extractPublicInputsPoP(proof);
        PublicKeyPoints memory points = getPublicKeyPoints(publicKey);

        // verify that:
        // 1) public key x extracted from the proof corresponds to the expected one
        // 2) public key y extracted from the proof corresponds to the expected one
        // 3) the signature has been stored and corresponds to the expected public key
        return
            keccak256(abi.encodePacked(points.x)) ==
            keccak256(abi.encodePacked(publicInputs.publicKeyPoints.x)) &&
            keccak256(abi.encodePacked(points.y)) ==
            keccak256(abi.encodePacked(publicInputs.publicKeyPoints.y)) &&
            _signatures[keccak256(publicInputs.signature)] ==
            keccak256(abi.encodePacked(points.x, points.y));
    }

    // verify the proof by calling the verifier contract
    function verifyProof(
        string calldata statementFunction,
        bytes calldata proof
    ) external view returns (bool result) {
        require(
            _verifiers[statementFunction] != address(0),
            "No verifier at this address"
        );

        Verifier verifier = Verifier(_verifiers[statementFunction]);
        return verifier.verify(proof);
    }
}
