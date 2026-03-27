// ─── Solidity Custom Error Decoder ───────────────────────────────
// Ethers.js v6 throws ErrorDecoder-compatible errors.
// This maps our contract's custom errors to user-friendly strings.

const CONTRACT_ERRORS = {
  // UserRegistry errors
  AlreadyRegistered: "This wallet already has a username.",
  UsernameTaken:     "That username is already taken. Try another.",
  InvalidUsername:   "Username must be 3–20 characters long.",
  NotRegistered:     "You need to register a username first.",

  // SocialGraph errors
  CannotFollowSelf:  "You can't follow yourself.",
  AlreadyFollowing:  "You're already following this user.",
  NotFollowing:      "You're not following this user.",

  // PostRegistry errors
  EmptyIPFSHash:     "Post must include an image.",
  PostNotFound:      "This post doesn't exist.",
};

/**
 * Extracts a user-friendly error message from any Ethers.js / contract error.
 * @param {Error} err - The raw error thrown by a contract call
 * @returns {string} - A human-readable error message
 */
export function parseContractError(err) {
  if (!err) return "An unknown error occurred.";

  // User rejected the transaction in MetaMask
  if (err.code === 4001 || err.code === "ACTION_REJECTED") {
    return "Transaction cancelled. You rejected the MetaMask request.";
  }

  // Check error message for known custom error names
  const message = err.message || "";

  for (const [errorName, friendlyMessage] of Object.entries(CONTRACT_ERRORS)) {
    if (message.includes(errorName)) {
      return friendlyMessage;
    }
  }

  // Ethers v6 sometimes puts the reason inside err.reason
  if (err.reason) return err.reason;

  // Insufficient gas / funds
  if (message.includes("insufficient funds")) {
    return "Insufficient Sepolia ETH. Get more from sepoliafaucet.com";
  }

  // Network error
  if (message.includes("network") || message.includes("fetch")) {
    return "Network error. Check your internet connection and Alchemy RPC URL.";
  }

  // Fallback: show first 100 chars of raw error
  return message.slice(0, 100) || "Transaction failed. Please try again.";
}