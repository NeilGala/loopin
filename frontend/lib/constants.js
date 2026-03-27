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