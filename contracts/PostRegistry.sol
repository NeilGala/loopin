// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PostRegistry
/// @notice Stores post ownership: IPFS hash + author address + timestamp.
///         Images live on IPFS (via Pinata). Only the content hash is on-chain.
contract PostRegistry {

    struct Post {
        uint256 id;
        address author;
        string  ipfsHash;   // IPFS CID of the image/media
        string  caption;
        uint256 timestamp;
    }

    uint256 private _postCount;

    /// @dev post ID → Post struct
    mapping(uint256 => Post) private _posts;

    /// @dev author address → array of their post IDs
    mapping(address => uint256[]) private _userPostIds;

    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string ipfsHash,
        uint256 timestamp
    );

    error EmptyIPFSHash();
    error PostNotFound();

    /// @notice Create a new post with an IPFS hash and caption
    /// @param ipfsHash The IPFS CID returned by Pinata after upload
    /// @param caption  Text caption for the post (stored on-chain, keep short)
    function createPost(string calldata ipfsHash, string calldata caption)
        external
        returns (uint256 postId)
    {
        if (bytes(ipfsHash).length == 0) revert EmptyIPFSHash();

        _postCount++;
        postId = _postCount;

        _posts[postId] = Post({
            id:        postId,
            author:    msg.sender,
            ipfsHash:  ipfsHash,
            caption:   caption,
            timestamp: block.timestamp
        });

        _userPostIds[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, ipfsHash, block.timestamp);
    }


    function getPost(uint256 postId) external view returns (Post memory) {
        if (_posts[postId].author == address(0)) revert PostNotFound();
        return _posts[postId];
    }

    function getUserPostIds(address user)
        external
        view
        returns (uint256[] memory)
    {
        return _userPostIds[user];
    }

    function getTotalPosts() external view returns (uint256) {
        return _postCount;
    }
}