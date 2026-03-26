// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SocialGraph
/// @notice Stores follow/unfollow relationships between wallet addresses.
///         The social graph is fully on-chain and owned by users.
contract SocialGraph {

    /// @dev follower → followee → bool
    mapping(address => mapping(address => bool)) private _following;

    /// @dev address → list of addresses they follow
    mapping(address => address[]) private _followingList;

    /// @dev address → list of addresses that follow them
    mapping(address => address[]) private _followersList;

    /// @dev address → follower count
    mapping(address => uint256) private _followerCount;

    /// @dev address → following count
    mapping(address => uint256) private _followingCount;

    event Followed(address indexed follower, address indexed followee);
    event Unfollowed(address indexed follower, address indexed followee);

    error CannotFollowSelf();
    error AlreadyFollowing();
    error NotFollowing();


    /// @notice Follow another wallet address
    function follow(address followee) external {
        if (followee == msg.sender) revert CannotFollowSelf();
        if (_following[msg.sender][followee]) revert AlreadyFollowing();

        _following[msg.sender][followee] = true;
        _followingList[msg.sender].push(followee);
        _followersList[followee].push(msg.sender);
        _followerCount[followee]++;
        _followingCount[msg.sender]++;

        emit Followed(msg.sender, followee);
    }

    /// @notice Unfollow a wallet address you currently follow
    function unfollow(address followee) external {
        if (!_following[msg.sender][followee]) revert NotFollowing();

        _following[msg.sender][followee] = false;
        _followerCount[followee]--;
        _followingCount[msg.sender]--;

        // Remove from followingList
        _removeFromArray(_followingList[msg.sender], followee);
        // Remove from followersList
        _removeFromArray(_followersList[followee], msg.sender);

        emit Unfollowed(msg.sender, followee);
    }


    function isFollowing(address follower, address followee)
        external
        view
        returns (bool)
    {
        return _following[follower][followee];
    }

    function getFollowerCount(address user) external view returns (uint256) {
        return _followerCount[user];
    }

    function getFollowingCount(address user) external view returns (uint256) {
        return _followingCount[user];
    }

    function getFollowing(address user)
        external
        view
        returns (address[] memory)
    {
        return _followingList[user];
    }

    function getFollowers(address user)
        external
        view
        returns (address[] memory)
    {
        return _followersList[user];
    }

    /// @dev Removes an address from an array by swap-and-pop (gas efficient)
    function _removeFromArray(address[] storage arr, address target) internal {
        uint256 len = arr.length;
        for (uint256 i = 0; i < len; i++) {
            if (arr[i] == target) {
                arr[i] = arr[len - 1]; // swap with last
                arr.pop();             // remove last
                break;
            }
        }
    }
}