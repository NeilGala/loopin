// ─── Chain Configuration ──────────────────────────────────────────
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // for MetaMask switchChain

export const SEPOLIA_NETWORK_CONFIG = {
  chainId:         SEPOLIA_CHAIN_ID_HEX,
  chainName:       "Sepolia test network",
  nativeCurrency: {
    name:     "SepoliaETH",
    symbol:   "ETH",
    decimals: 18,
  },
  rpcUrls:         [process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

// ─── IPFS ─────────────────────────────────────────────────────────
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  "https://gateway.pinata.cloud/ipfs/";

// Helper: convert IPFS hash to full URL
export function ipfsToUrl(hash) {
  if (!hash) return null;
  if (hash.startsWith("http")) return hash; // already a URL
  return `${IPFS_GATEWAY}${hash}`;
}

// ─── App Config ───────────────────────────────────────────────────
export const APP_NAME    = "Loopin";
export const APP_TAGLINE = "Your world. On-chain.";

// ─── Time formatting ──────────────────────────────────────────────
export function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000 - Number(timestamp));
  if (seconds < 60)    return "just now";
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  // Older than a week — show the date
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
  });
}

// ─── Address formatting ───────────────────────────────────────────
export function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ─── Feed config ──────────────────────────────────────────────────
export const FEED_PAGE_SIZE    = 12;   // posts per page
export const FETCH_BATCH_SIZE  = 10;   // parallel contract reads per batch