// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

import "./zkpToken.sol";
import "./zkpVerifier.sol";

contract ZkpContract {
    address private owner;
    ZkpToken private zkpToken;
    ZkpVerifier private zkpVerifier;

    // Public keys
    event PublicKeyVersion(uint);

    mapping(string => string[]) public publicKeys;
    mapping(string => uint256) private tokenIds;

    // Signatures: hash(signature) => hash(public key)
    mapping(bytes32 => bytes32) private signatures;

    constructor(address zkpTokenAddress, address zkpVerifierAddress) {
        owner = msg.sender;
        zkpToken = ZkpToken(zkpTokenAddress);
        zkpVerifier = ZkpVerifier(zkpVerifierAddress);
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
        require(bytes(publicKey).length != 0, "Public key cannot be empty");
        uint256 tokenId = zkpToken.userToToken(msg.sender);
        require(tokenId > 0, "Caller is not authorized to set a public key");

        // check if name is already used
        if (publicKeys[name].length > 0) {
            require(
                tokenId == tokenIds[name],
                "Caller is not authorized to update the public key"
            );
        } else {
            // associate the name with the token ID
            tokenIds[name] = tokenId;
        }

        publicKeys[name].push(publicKey);

        uint version = publicKeys[name].length - 1;
        emit PublicKeyVersion(version);
        return version;
    }

    // ZKP PROOF VERIFICATION

    struct PublicInputs {
        bytes publicKey_x;
        bytes publicKey_y;
        bytes signature;
    }

    // extract the public inputs embedded in the proof
    function extractPublicInputs(
        bytes calldata proof
    ) internal pure returns (PublicInputs memory) {
        bytes memory signature = new bytes(64);
        uint filteredIndex = 0;
        for (uint i = 95; i < 2112; i += 32) {
            signature[filteredIndex] = proof[i];
            filteredIndex++;
        }

        // Public key x is at position [0:32)
        // Public key y is at position [32:64)
        // Signature is at position [95:2112) mod 32 (see above)
        return PublicInputs(proof[0:32], proof[32:64], signature);
    }

    // store a signature as a hash
    function storeSignature(
        bytes calldata publicKey_x,
        bytes calldata publicKey_y,
        bytes calldata signature
    ) external {
        require(
            zkpToken.userToToken(msg.sender) > 0,
            "Caller is not authorized to store a signature"
        );

        signatures[keccak256(signature)] = keccak256(
            abi.encodePacked(publicKey_x, publicKey_y)
        );
    }

    // check whether a signature has been stored or not
    function checkSignature(
        bytes calldata publicKey_x,
        bytes calldata publicKey_y,
        bytes calldata signature
    ) external view returns (bool) {
        return
            signatures[keccak256(signature)] ==
            keccak256(abi.encodePacked(publicKey_x, publicKey_y));
    }

    function verifyPublicInputs(
        bytes calldata publicKey_x,
        bytes calldata publicKey_y,
        bytes calldata proof
    ) external view returns (bool) {
        // extract public key from proof
        PublicInputs memory publicInputs = extractPublicInputs(proof);

        // verify that:
        // 1) public key x extracted from the proof corresponds to the expected one
        // 2) public key y extracted from the proof corresponds to the expected one
        // 3) the signature has been stored and corresponds to the expected public key
        return
            keccak256(abi.encodePacked(publicKey_x)) ==
            keccak256(abi.encodePacked(publicInputs.publicKey_x)) &&
            keccak256(abi.encodePacked(publicKey_y)) ==
            keccak256(abi.encodePacked(publicInputs.publicKey_y)) &&
            signatures[keccak256(publicInputs.signature)] ==
            keccak256(abi.encodePacked(publicKey_x, publicKey_y));
    }

    function verifyProof(
        bytes calldata proof
    ) external view returns (bool result) {
        return zkpVerifier.verify(proof);
    }
}
