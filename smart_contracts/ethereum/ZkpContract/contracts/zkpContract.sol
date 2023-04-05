// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

import "./ZkpToken.sol";

contract ZkpContract {
    // tokenId => public key name => public key
    mapping(uint256 => mapping(string => string)) public publicKeys;

    address private owner;
    ZkpToken private zkpToken;

    constructor(address zkpTokenAddress) {
        owner = msg.sender;
        zkpToken = ZkpToken(zkpTokenAddress);
    }

    function getPublicKey(
        uint256 tokenId,
        string memory name
    ) public view returns (string memory) {
        return publicKeys[tokenId][name];
    }

    function setPublicKey(
        uint256 tokenId,
        string memory name,
        string memory publicKey
    ) public {
        require(bytes(publicKey).length != 0, "Public key cannot be empty");
        require(zkpToken.tokenIdExists(tokenId), "Token ID does not exist");
        require(
            zkpToken.isApprovedOrOwner(msg.sender, tokenId),
            "Caller is not approved or the owner of the corresponding ZKP token"
        );

        // check if name is already defined for this token id
        if (bytes(publicKeys[tokenId][name]).length > 0) {
            // if sender is not the owner of the token, revert
            require(
                zkpToken.isApprovedOrOwner(msg.sender, tokenId),
                "Caller is not the owner of the token"
            );
            // update the existing value associated with this token id and this name
            publicKeys[tokenId][name] = publicKey;
        } else {
            // ensure that the name is unique
            for (uint i = 0; i < zkpToken.totalSupply(); i++) {
                require(
                    bytes(publicKeys[tokenId][name]).length == 0,
                    "Name is already taken"
                );
            }
            // set the new value
            publicKeys[tokenId][name] = publicKey;
        }
    }

    function isUserAuthorized(uint256 tokenId) public view returns (bool) {
        return zkpToken.isApprovedOrOwner(msg.sender, tokenId);
    }
}
