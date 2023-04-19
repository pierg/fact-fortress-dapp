// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// This contract manages ERC721 tokens (non-fungible tokens) to allow
// researchers to manage their public keys on-chain
contract ZkpHealthResearcherToken is ERC721 {
    address private _owner;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ResearcherToken {
        uint256 _tokenId;
        string[] _accessTypes;
    }

    // set of access types
    mapping(string => bool) private _accessTypes;
    string[] private _allAccessTypes;

    // address => token ID
    // (0 if the address has not token)
    mapping(address => ResearcherToken) private _userToToken;

    constructor() ERC721("ZKP Health Researcher Token", "ZKPHR") {
        _owner = msg.sender;
    }

    // mint (create) a new token for and send it to a researcher
    // with a set of access types
    function authorizeResearcher(
        address user,
        string[] memory accessTypes
    ) external returns (uint256) {
        // only the owner of the contract should be able to mint
        require(msg.sender == _owner, "Caller is not the owner");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);

        _userToToken[user] = ResearcherToken(newItemId, accessTypes);

        for (uint256 i = 0; i < accessTypes.length; i++) {
            if (!_accessTypes[accessTypes[i]]) {
                _allAccessTypes.push(accessTypes[i]);
            }
            _accessTypes[accessTypes[i]] = true;
        }

        return newItemId;
    }

    // allows a researcher to transfer its token to another address
    // (e.g. a new wallet)
    // Note: the access types remain the same
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
        _userToToken[to]._tokenId = tokenId;
    }

    function userToToken(
        address user
    ) external view returns (ResearcherToken memory) {
        return _userToToken[user];
    }

    function tokenIdExists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    function getAllAccessTypes() external view returns (string[] memory) {
        return _allAccessTypes;
    }

    function getOwnAccessTypes() external view returns (string[] memory) {
        require(_userToToken[msg.sender]._tokenId > 0, "Caller has not token");
        return _userToToken[msg.sender]._accessTypes;
    }
}
