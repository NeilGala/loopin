import { ethers } from "ethers";

// ─── Contract Addresses ───────────────────────────────────────────
export const CONTRACT_ADDRESSES = {
  UserRegistry:  process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS,
  SocialGraph:   process.env.NEXT_PUBLIC_SOCIAL_GRAPH_ADDRESS,
  PostRegistry:  process.env.NEXT_PUBLIC_POST_REGISTRY_ADDRESS,
};

// ─── ABIs (copied from Hardhat artifacts after compile) ───────────
// We inline the ABI here so Next.js can import it without
// needing access to the Hardhat artifacts/ folder at runtime.

export const USER_REGISTRY_ABI = [
  "function register(string calldata username) external",
  "function updateProfile(string calldata bio, string calldata avatarHash) external",
  "function getUsername(address wallet) external view returns (string memory)",
  "function getAddressByUsername(string calldata username) external view returns (address)",
  "function getBio(address wallet) external view returns (string memory)",
  "function getAvatar(address wallet) external view returns (string memory)",
  "function isRegistered(address wallet) external view returns (bool)",
  "event UserRegistered(address indexed wallet, string username)",
  "event ProfileUpdated(address indexed wallet, string bio, string avatarHash)",
  "error AlreadyRegistered()",
  "error UsernameTaken()",
  "error InvalidUsername()",
  "error NotRegistered()",
];

export const SOCIAL_GRAPH_ABI = [
  "function follow(address followee) external",
  "function unfollow(address followee) external",
  "function isFollowing(address follower, address followee) external view returns (bool)",
  "function getFollowerCount(address user) external view returns (uint256)",
  "function getFollowingCount(address user) external view returns (uint256)",
  "function getFollowing(address user) external view returns (address[] memory)",
  "function getFollowers(address user) external view returns (address[] memory)",
  "event Followed(address indexed follower, address indexed followee)",
  "event Unfollowed(address indexed follower, address indexed followee)",
  "error CannotFollowSelf()",
  "error AlreadyFollowing()",
  "error NotFollowing()",
];

export const POST_REGISTRY_ABI = [
  "function createPost(string calldata ipfsHash, string calldata caption) external returns (uint256 postId)",
  "function getPost(uint256 postId) external view returns (tuple(uint256 id, address author, string ipfsHash, string caption, uint256 timestamp))",
  "function getUserPostIds(address user) external view returns (uint256[] memory)",
  "function getTotalPosts() external view returns (uint256)",
  "event PostCreated(uint256 indexed postId, address indexed author, string ipfsHash, uint256 timestamp)",
  "error EmptyIPFSHash()",
  "error PostNotFound()",
];

// ─── Contract Instance Factories ──────────────────────────────────

/**
 * Returns a read-only contract instance (no wallet needed)
 * Used for fetching public data
 */
export function getReadOnlyContract(name, provider) {
  const address = CONTRACT_ADDRESSES[name];
  const abi = getABI(name);
  if (!address) throw new Error(`Contract address for ${name} not set in .env.local`);
  return new ethers.Contract(address, abi, provider);
}

/**
 * Returns a writable contract instance (requires connected wallet)
 * Used for transactions (register, follow, createPost, etc.)
 */
export function getWritableContract(name, signer) {
  const address = CONTRACT_ADDRESSES[name];
  const abi = getABI(name);
  if (!address) throw new Error(`Contract address for ${name} not set in .env.local`);
  return new ethers.Contract(address, abi, signer);
}

function getABI(name) {
  const abis = {
    UserRegistry: USER_REGISTRY_ABI,
    SocialGraph:  SOCIAL_GRAPH_ABI,
    PostRegistry: POST_REGISTRY_ABI,
  };
  if (!abis[name]) throw new Error(`Unknown contract: ${name}`);
  return abis[name];
}