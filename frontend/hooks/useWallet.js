"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX, SEPOLIA_NETWORK_CONFIG } from "@/lib/constants";

export function useWallet() {
  const [address,       setAddress]       = useState(null);
  const [provider,      setProvider]      = useState(null);
  const [signer,        setSigner]        = useState(null);
  const [chainId,       setChainId]       = useState(null);
  const [isConnecting,  setIsConnecting]  = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // ← NEW
  const [error,         setError]         = useState(null);

  const isMetaMaskInstalled = () =>
    typeof window !== "undefined" && Boolean(window.ethereum?.isMetaMask);

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_NETWORK_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install it from metamask.io");
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer   = await web3Provider.getSigner();
      const network      = await web3Provider.getNetwork();
      const currentChainId = Number(network.chainId);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(accounts[0]);
      setChainId(currentChainId);

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      }
    } catch (err) {
      if (err.code === 4001) {
        setError("Connection rejected. Please approve the MetaMask request.");
      } else {
        setError(err.message || "Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [switchToSepolia]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  // ── On mount: check if MetaMask already has an active session ────
  // This is what was missing — isInitialized stays false until this
  // async check completes, preventing premature routing decisions.
  useEffect(() => {
    if (!isMetaMaskInstalled()) {
      setIsInitialized(true); // no MetaMask = initialized (just not connected)
      return;
    }

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged",    handleChainChanged);

    // Check for existing connection — THEN mark as initialized
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts) => {
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const web3Signer   = await web3Provider.getSigner();
          const network      = await web3Provider.getNetwork();
          setAddress(accounts[0]);
          setProvider(web3Provider);
          setSigner(web3Signer);
          setChainId(Number(network.chainId));
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsInitialized(true); // ← always fires, connected or not
      });

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged",    handleChainChanged);
    };
  }, [disconnect]);

  return {
    address,
    provider,
    signer,
    chainId,
    isConnecting,
    isInitialized,  // ← exported so pages can wait for it
    isConnected:  Boolean(address),
    isOnSepolia,
    error,
    connect,
    disconnect,
    switchToSepolia,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };
}