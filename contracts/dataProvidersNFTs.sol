// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// This contract manages ERC721 tokens (non-fungible tokens) to allow
// authorities to manage their public keys on-chain
contract DataProvidersNFTs is ERC721 {
    address private _owner;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // address => token ID
    // (0 if the address has not token)
    mapping(address => uint256) private _userToToken;

    constructor() ERC721("Fact Fortress Provider Token", "FFP") {
        _owner = msg.sender;
    }

    // mint (create) a new token for and send it to a data provider
    function authorizeProvider(address user) external returns (uint256) {
        // only the owner of the contract should be able to mint
        require(msg.sender == _owner, "Caller is not the owner");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);

        _userToToken[user] = newItemId;

        return newItemId;
    }

    // remove an authorization
    // TODO(Guillaume): improve the implementation
    function unauthorizeProvider(address user) external {
        // only the owner of the contract should be able to remove an authorization
        require(msg.sender == _owner, "Caller is not the owner");

        delete _userToToken[user];
    }

    // allows a data provider to transfer its token to another address
    // (e.g. a new wallet)
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not token owner or approved"
        );

        _transfer(from, to, tokenId);

        // update map associating the tokens with their owners
        _userToToken[to] = tokenId;
    }

    function userToToken(address user) external view returns (uint256) {
        return _userToToken[user];
    }

    function tokenIdExists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}
