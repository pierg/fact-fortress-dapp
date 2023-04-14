// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ZkpToken is ERC721 {
    using Counters for Counters.Counter;
    address private _owner;
    Counters.Counter private _tokenIds;
    mapping(address => uint256) private _userToToken;

    constructor() ERC721("ZKP Token", "ZKP") {
        _owner = msg.sender;
    }

    function mint(address user) external returns (uint256) {
        // only the owner of the contract should be able to mint
        require(msg.sender == _owner, "Caller is not the owner");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);

        _userToToken[user] = newItemId;

        return newItemId;
    }

    function userToToken(address user) external view returns (uint256) {
        require(_userToToken[user] > 0, "Address does not have a token");
        return _userToToken[user];
    }

    function isApprovedOrOwner(
        address user,
        uint256 tokenId
    ) external view returns (bool) {
        require(_exists(tokenId), "Nonexistent ZKP token");
        address owner = ownerOf(tokenId);
        return (user == owner ||
            getApproved(tokenId) == user ||
            isApprovedForAll(owner, user));
    }

    function tokenIdExists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}
