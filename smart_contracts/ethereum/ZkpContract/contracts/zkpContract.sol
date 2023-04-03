// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

contract ZkpContract {
    mapping(address => mapping(string => string)) public publicKeys;
    mapping(address => bool) private authorizedUsers;
    address private owner;

    constructor() {
        owner = msg.sender;
        authorizedUsers[0x1234567890123456789012345678901234567890] = true; // replace with Hospital A address
        authorizedUsers[0x0987654321098765432109876543210987654321] = true; // replace with Hospital B address
        // etc.
    }

    function getPublicKey(address userAddress, string memory name) public view returns (string memory) {
        return publicKeys[userAddress][name];
    }

    function setPublicKey(string memory name, string memory publicKey) public {
        require(authorizedUsers[msg.sender], "Caller is not authorized to change this public key");
        publicKeys[msg.sender][name] = publicKey;
    }

    function authorizeUser(address userAddress) public {
        require(msg.sender == owner, "Caller is not the owner");
        authorizedUsers[userAddress] = true;
    }

    function revokeUser(address userAddress) public {
        require(msg.sender == owner, "Caller is not the owner");
        delete authorizedUsers[userAddress];
    }

    function isUserAuthorized(address userAddress) public view returns (bool) {
        return authorizedUsers[userAddress];
    }
}