// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

import "./zkpToken.sol";
import "./zkpVerifier.sol";

contract ZkpContract {
    event PublicKeyVersion(uint);

    // public key name => public key
    mapping(string => string[]) public publicKeys;

    // public key name => token ID
    mapping(string => uint256) private tokenIds;

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
        require(tokenId > 0, "Caller does not have a token");

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

    function verifyPublicKey(
        bytes calldata pubKey_X,
        bytes calldata pubKey_Y,
        bytes calldata proof
    ) external view returns (bool) {
        // extract public key from proof
        bytes calldata pubKeyProof_X = proof[0:32];
        bytes calldata pubKeyProof_Y = proof[32:64];

        return
            keccak256(abi.encodePacked(pubKey_X)) ==
            keccak256(abi.encodePacked(pubKeyProof_X)) &&
            keccak256(abi.encodePacked(pubKey_Y)) ==
            keccak256(abi.encodePacked(pubKeyProof_Y));
    }

    function verifyProof(
        bytes calldata proof
    ) external view returns (bool result) {
        return zkpVerifier.verify(proof);
    }
}
