"use client";

import { useState, useCallback } from "react";
import { getWritableContract, getReadOnlyContract } from "@/lib/contracts";
import { parseContractError } from "@/lib/errors";
import { ethers } from "ethers";

export function useUserRegistry() {
  const [txStatus,  setTxStatus]  = useState(null);   // waiting | pending | success | error
  const [txHash,    setTxHash]    = useState(null);
  const [txError,   setTxError]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ── Reset transaction state ──────────────────────────────────────
  const resetTx = useCallback(() => {
    setTxStatus(null);
    setTxHash(null);
    setTxError(null);
  }, []);

  // ── Check if a wallet is registered ─────────────────────────────
  const checkIsRegistered = useCallback(async (address) => {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL
      );
      const contract = getReadOnlyContract("UserRegistry", provider);
      return await contract.isRegistered(address);
    } catch (err) {
      console.error("checkIsRegistered error:", err);
      return false;
    }
  }, []);

  // ── Get username for a wallet address ───────────────────────────
  const getUsername = useCallback(async (address) => {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL
      );
      const contract = getReadOnlyContract("UserRegistry", provider);
      return await contract.getUsername(address);
    } catch (err) {
      console.error("getUsername error:", err);
      return null;
    }
  }, []);

  // ── Get full profile for a wallet address ────────────────────────
  const getProfile = useCallback(async (address) => {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL
      );
      const contract = getReadOnlyContract("UserRegistry", provider);

      const [username, bio, avatar] = await Promise.all([
        contract.getUsername(address),
        contract.getBio(address),
        contract.getAvatar(address),
      ]);

      return { username, bio, avatar, address };
    } catch (err) {
      console.error("getProfile error:", err);
      return null;
    }
  }, []);

  // ── Register a new username ──────────────────────────────────────
  const register = useCallback(async (username, signer) => {
    resetTx();
    setIsLoading(true);

    try {
      // Step 1: Show MetaMask popup
      setTxStatus("waiting");
      const contract = getWritableContract("UserRegistry", signer);
      const tx = await contract.register(username);

      // Step 2: Tx submitted — waiting for mining
      setTxHash(tx.hash);
      setTxStatus("pending");

      // Step 3: Wait for 1 confirmation on Sepolia
      await tx.wait(1);

      // Step 4: Success
      setTxStatus("success");
      return { success: true, txHash: tx.hash };

    } catch (err) {
      const friendly = parseContractError(err);
      setTxError(friendly);
      setTxStatus("error");
      return { success: false, error: friendly };
    } finally {
      setIsLoading(false);
    }
  }, [resetTx]);

  // ── Update profile (bio + avatar) ───────────────────────────────
  const updateProfile = useCallback(async (bio, avatarHash, signer) => {
    resetTx();
    setIsLoading(true);

    try {
      setTxStatus("waiting");
      const contract = getWritableContract("UserRegistry", signer);
      const tx = await contract.updateProfile(bio, avatarHash);

      setTxHash(tx.hash);
      setTxStatus("pending");
      await tx.wait(1);

      setTxStatus("success");
      return { success: true, txHash: tx.hash };

    } catch (err) {
      const friendly = parseContractError(err);
      setTxError(friendly);
      setTxStatus("error");
      return { success: false, error: friendly };
    } finally {
      setIsLoading(false);
    }
  }, [resetTx]);

  return {
    txStatus,
    txHash,
    txError,
    isLoading,
    resetTx,
    checkIsRegistered,
    getUsername,
    getProfile,
    register,
    updateProfile,
  };
}