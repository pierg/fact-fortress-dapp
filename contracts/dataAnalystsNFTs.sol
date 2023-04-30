// SPDX-License-Identifier: MIT
/// @author Guillaume Lethuillier

pragma solidity ^0.8.1;

import "./dataProvidersNFTs.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// This contract manages ERC721 tokens (non-fungible tokens) to allow
// data analysts to manage their public keys on-chain
contract DataAnalystsNFTs is ERC721 {
    address private _owner;
    DataProvidersNFTs private _dataProvidersNFTs;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct AnalystToken {
        uint256 tokenId;
        string[] accessPolicies;
    }

    // set of access policies
    // TODO(Guillaume): to improve (set of strings...), obviously;
    //                  okayish just for demo purposes
    mapping(string => bool) private _accessPolicies;
    string[] private _allAccessPolicies;

    // address => token ID
    // (0 if the address has not token)
    mapping(address => AnalystToken) private _userToToken;

    constructor(
        address dataProvidersNFTsAddress
    ) ERC721("Fact Fortress Analyst Token", "FFA") {
        _owner = msg.sender;
        _dataProvidersNFTs = DataProvidersNFTs(dataProvidersNFTsAddress);
        initializeDefaultPolicies();
    }

    function initializeDefaultPolicies() internal {
        _allAccessPolicies.push("default_policy");
    }

    // mint (create) a new token for and send it to a data analyst
    // with a set of access policies
    function authorizeAnalyst(
        address user,
        string[] memory accessPolicies
    ) external returns (uint256) {
        // only the owner of the contract or a data provider should be able to mint
        require(
            (msg.sender == _owner) ||
                (_dataProvidersNFTs.userToToken(msg.sender) > 0),
            "Caller is not the owner nor a data provider"
        );

        for (uint256 i = 0; i < accessPolicies.length; i++) {
            if (!_accessPolicies[accessPolicies[i]]) {
                revert("unknown policy");
            }
        }

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);

        _userToToken[user] = AnalystToken(newItemId, accessPolicies);

        return newItemId;
    }

    // remove an authorization
    // TODO(Guillaume): improve the implementation
    function unauthorizeAnalyst(address user) external {
        require(
            (msg.sender == _owner) ||
                (_dataProvidersNFTs.userToToken(msg.sender) > 0),
            "Caller is not the owner nor a data provider"
        );

        // TODO(Guillaume): remove access policies specific to this user
        //                  (for demo purposes, will be delegated to the backend)

        delete _userToToken[user];
    }

    // allows a data analyst to transfer its token to another address
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
        _userToToken[to].tokenId = tokenId;
    }

    function userToToken(
        address user
    ) external view returns (AnalystToken memory) {
        return _userToToken[user];
    }

    function tokenIdExists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    function getAllAccessPolicies() external view returns (string[] memory) {
        return _allAccessPolicies;
    }

    function getAccessPolicies(
        address user
    ) external view returns (string[] memory) {
        return _userToToken[user].accessPolicies;
    }

    // reset all access policies
    // TODO(Guillaume): improve the implementation
    function removeAllAccessPolicies() external {
        require(msg.sender == _owner, "Caller is not the owner");

        for (uint256 i = 0; i < _allAccessPolicies.length; i++) {
            delete _accessPolicies[_allAccessPolicies[i]];
        }

        delete _allAccessPolicies;
        initializeDefaultPolicies();
    }

    function setAllAccessPolicies(string[] memory accessPolicies) external {
        // only the owner of the contract or a data provider should be able to set all access policies
        require(
            (msg.sender == _owner) ||
                (_dataProvidersNFTs.userToToken(msg.sender) > 0),
            "Caller is not the owner nor a data provider"
        );

        for (uint256 i = 0; i < accessPolicies.length; i++) {
            if (!_accessPolicies[accessPolicies[i]]) {
                _allAccessPolicies.push(accessPolicies[i]);
            }
            _accessPolicies[accessPolicies[i]] = true;
        }
    }
}
