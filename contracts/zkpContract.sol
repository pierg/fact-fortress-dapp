// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

import "./zkpToken.sol";
import "./zkpVerifier.sol";

contract ZkpContract {
    event PublicKeyVersion(uint);

    // tokenId => public key name => public key
    mapping(uint256 => mapping(string => string[])) public publicKeys;

    address private owner;
    ZkpToken private zkpToken;
    ZkpVerifier private zkpVerifier;

    constructor(address zkpTokenAddress, address zkpVerifierAddress) {
        owner = msg.sender;
        zkpToken = ZkpToken(zkpTokenAddress);
        zkpVerifier = ZkpVerifier(zkpVerifierAddress);
    }

    // PUBLIC KEYS MANAGEMENT

    function getPublicKey(
        uint256 tokenId,
        string memory name,
        uint version
    ) external view returns (string memory) {
        require(
            version < publicKeys[tokenId][name].length,
            "Public key does not exist (invalid version)"
        );
        return publicKeys[tokenId][name][version];
    }

    function getLatestPublicKey(
        uint256 tokenId,
        string memory name
    ) external view returns (string memory) {
        require(
            publicKeys[tokenId][name].length > 0,
            "Public key does not exist for this token ID and name"
        );
        uint lastIndex = publicKeys[tokenId][name].length - 1;
        return publicKeys[tokenId][name][lastIndex];
    }

    function setPublicKey(
        uint256 tokenId,
        string memory name,
        string memory publicKey
    ) external returns (uint) {
        require(bytes(publicKey).length != 0, "Public key cannot be empty");
        require(zkpToken.tokenIdExists(tokenId), "Token ID does not exist");
        require(
            zkpToken.isApprovedOrOwner(msg.sender, tokenId),
            "Caller is not approved or the owner of the corresponding ZKP token"
        );

        // check if name is already defined for this token id
        if (publicKeys[tokenId][name].length > 0) {
            // if sender is not the owner of the token, revert
            require(
                zkpToken.isApprovedOrOwner(msg.sender, tokenId),
                "Caller is not the owner of the token"
            );
            // add a new public key for this token id and this name
            publicKeys[tokenId][name].push(publicKey);
        } else {
            // ensure that the name is unique
            for (uint i = 0; i < zkpToken.totalSupply(); i++) {
                require(
                    publicKeys[tokenId][name].length == 0,
                    "Name is already taken"
                );
            }
            // set the new value
            publicKeys[tokenId][name].push(publicKey);
        }

        uint version = publicKeys[tokenId][name].length - 1;
        emit PublicKeyVersion(version);
        return version;
    }

    function isUserAuthorized(uint256 tokenId) external view returns (bool) {
        return zkpToken.isApprovedOrOwner(msg.sender, tokenId);
    }

    // ZKP PROOF VERIFICATION

    function verifyPublicKey(
        bytes calldata pubKey_X,
        bytes calldata pubKey_Y,
        bytes calldata proof
    ) external view returns (bool) {
        // extract public key from proof
        bytes calldata pubKeyProof_X = proof[0:32];
        bytes calldata pubKeyProof_Y = proof[32:64];

        return keccak256(abi.encodePacked(pubKey_X)) == keccak256(abi.encodePacked(pubKeyProof_X)) 
            && keccak256(abi.encodePacked(pubKey_Y)) == keccak256(abi.encodePacked(pubKeyProof_Y));
    }

    function verifyProof(
        bytes calldata proof
    ) external view returns (bool result) {
        return zkpVerifier.verify(proof);
    }
}