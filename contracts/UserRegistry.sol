// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title UserRegistry
/// @notice Maps wallet addresses to usernames on-chain.
///         One address = one username. Usernames are unique.
contract UserRegistry {

    /// @dev Maps wallet address → username string
    mapping(address => string) private _usernames;

    /// @dev Maps username (lowercase) → wallet address
    ///      Used to enforce uniqueness
    mapping(string => address) private _usernameToAddress;

    /// @dev Maps wallet address → bio string
    mapping(address => string) private _bios;

    /// @dev Maps wallet address → IPFS hash of avatar image
    mapping(address => string) private _avatars;

    /// @dev Tracks whether an address has registered
    mapping(address => bool) private _registered;

    event UserRegistered(address indexed wallet, string username);
    event ProfileUpdated(address indexed wallet, string bio, string avatarHash);

    error AlreadyRegistered();
    error UsernameTaken();
    error InvalidUsername();
    error NotRegistered();

    /// @notice Register a new username for the calling wallet
    /// @param username Must be 3–20 chars, alphanumeric + underscores only
    function register(string calldata username) external {
        if (_registered[msg.sender]) revert AlreadyRegistered();

        string memory lower = _toLower(username);

        if (bytes(lower).length < 3 || bytes(lower).length > 20)
            revert InvalidUsername();

        if (_usernameToAddress[lower] != address(0))
            revert UsernameTaken();

        _usernames[msg.sender] = username;
        _usernameToAddress[lower] = msg.sender;
        _registered[msg.sender] = true;

        emit UserRegistered(msg.sender, username);
    }


    /// @notice Update bio and/or avatar IPFS hash
    function updateProfile(
        string calldata bio,
        string calldata avatarHash
    ) external {
        if (!_registered[msg.sender]) revert NotRegistered();
        _bios[msg.sender] = bio;
        _avatars[msg.sender] = avatarHash;
        emit ProfileUpdated(msg.sender, bio, avatarHash);
    }

    function getUsername(address wallet) external view returns (string memory) {
        return _usernames[wallet];
    }

    function getAddressByUsername(string calldata username)
        external
        view
        returns (address)
    {
        return _usernameToAddress[_toLower(username)];
    }

    function getBio(address wallet) external view returns (string memory) {
        return _bios[wallet];
    }

    function getAvatar(address wallet) external view returns (string memory) {
        return _avatars[wallet];
    }

    function isRegistered(address wallet) external view returns (bool) {
        return _registered[wallet];
    }


    /// @dev Converts a string to lowercase for case-insensitive username checks
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint256 i = 0; i < bStr.length; i++) {
            if (bStr[i] >= 0x41 && bStr[i] <= 0x5A) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}