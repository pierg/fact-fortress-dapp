// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// This contract manages ERC721 tokens (non-fungible tokens) to allow
// data analyzers to manage their public keys on-chain
contract DataAnalyzersNFTs is ERC721 {
    address private _owner;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct AnalyzerToken {
        uint256 _tokenId;
        string[] _accessPolicies;
    }

    // set of access policies
    // TODO(Guillaume): to improve (set of strings...), obviously;
    //                  okayish just for demo purposes
    mapping(string => bool) private _accessPolicies;
    string[] private _allaccessPolicies;

    // address => token ID
    // (0 if the address has not token)
    mapping(address => AnalyzerToken) private _userToToken;

    constructor() ERC721("Fact Fortress Analyzer Token", "FFA") {
        _owner = msg.sender;
        initializeDefaultPolicies();
    }

    // set default access policies
    function initializeDefaultPolicies() internal {
        _allaccessPolicies.push("default_policy");
    }

    // mint (create) a new token for and send it to a data analyzer
    // with a set of access policies
    function authorizeAnalyzer(
        address user,
        string[] memory accessPolicies
    ) external returns (uint256) {
        // only the owner of the contract should be able to mint
        require(msg.sender == _owner, "Caller is not the owner");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);

        _userToToken[user] = AnalyzerToken(newItemId, accessPolicies);

        for (uint256 i = 0; i < accessPolicies.length; i++) {
            if (!_accessPolicies[accessPolicies[i]]) {
                _allaccessPolicies.push(accessPolicies[i]);
            }
            _accessPolicies[accessPolicies[i]] = true;
        }

        return newItemId;
    }

    // remove an authorization
    // TODO(Guillaume): improve the implementation
    function unauthorizeAnalyzer(address user) external {
        require(msg.sender == _owner, "Caller is not the owner"); // TODO(Guillaume): extend to authorities

        // TODO(Guillaume): remove access policies specific to this user
        //                  (for demo purposes, will be delegated to the backend)

        delete _userToToken[user];
    }

    // allows a data analyzer to transfer its token to another address
    // (e.g. a new wallet)
    // Note: the access policies remain the same
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
    ) external view returns (AnalyzerToken memory) {
        return _userToToken[user];
    }

    function tokenIdExists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    function getAllAccessPolicies() external view returns (string[] memory) {
        return _allaccessPolicies;
    }

    function getAccessPolicies(
        address user
    ) external view returns (string[] memory) {
        return _userToToken[user]._accessPolicies;
    }

    // reset all access policies
    // TODO(Guillaume): improve the implementation
    function removeAllAccessPolicies() external {
        require(msg.sender == _owner, "Caller is not the owner");

        for (uint256 i = 0; i < _allaccessPolicies.length; i++) {
            delete _accessPolicies[_allaccessPolicies[i]];
        }

        delete _allaccessPolicies;
        initializeDefaultPolicies();
    }
}
