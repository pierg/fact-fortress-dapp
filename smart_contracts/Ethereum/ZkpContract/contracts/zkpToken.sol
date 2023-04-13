// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ZkpToken is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(address => uint256) private _userToToken;

    constructor() ERC721("ZKP Token", "ZKP") {}

    function mint(address user) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);

        _userToToken[user] = newItemId;

        return newItemId;
    }

    function userToToken(address user) public view returns (uint256) {
        return _userToToken[user];
    }

    function isApprovedOrOwner(
        address user,
        uint256 tokenId
    ) public view returns (bool) {
        require(_exists(tokenId), "nonexistent ZKP token");
        address owner = ownerOf(tokenId);
        return (user == owner ||
            getApproved(tokenId) == user ||
            isApprovedForAll(owner, user));
    }

    function tokenIdExists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
