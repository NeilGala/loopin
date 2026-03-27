"use client";

import { useWallet } from "@/hooks/useWallet";

// Shortens wallet address: 0x1234...5678
function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletConnect() {
  const {
    address,
    isConnected,
    isConnecting,
    isOnSepolia,
    isMetaMaskInstalled,
    error,
    connect,
    disconnect,
    switchToSepolia,
  } = useWallet();

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
  <a
    href="https://metamask.io/download/"
    target="_blank"
    rel="noopener noreferrer"
    className="btn-primary inline-block text-center"
  >
    Install MetaMask
  </a>
);
  }

  // Connected but wrong network
  if (isConnected && !isOnSepolia) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-yellow-400 text-sm">⚠️ Wrong network detected</p>
        <button onClick={switchToSepolia} className="btn-primary">
          Switch to Sepolia
        </button>
      </div>
    );
  }

  // Connected and on Sepolia
  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-200">
            {shortAddress(address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="btn-secondary text-sm px-4 py-2"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Not connected
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn-primary min-w-[200px]"
      >
        {isConnecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Connecting...
          </span>
        ) : (
          "Connect Wallet"
        )}
      </button>
      {error && (
        <p className="text-red-400 text-sm text-center max-w-xs">{error}</p>
      )}
    </div>
  );
}