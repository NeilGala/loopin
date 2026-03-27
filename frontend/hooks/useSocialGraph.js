"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { getWritableContract, getReadOnlyContract } from "@/lib/contracts";
import { parseContractError } from "@/lib/errors";

export function useSocialGraph() {
  const [txStatus,  setTxStatus]  = useState(null);
  const [txHash,    setTxHash]    = useState(null);
  const [txError,   setTxError]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetTx = useCallback(() => {
    setTxStatus(null);
    setTxHash(null);
    setTxError(null);
  }, []);

  // ── Shared read-only provider ──────────────────────────────────
  const getProvider = () =>
    new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);

  // ── Check if follower follows followee ─────────────────────────
  const checkIsFollowing = useCallback(async (follower, followee) => {
    try {
      const contract = getReadOnlyContract("SocialGraph", getProvider());
      return await contract.isFollowing(follower, followee);
    } catch (err) {
      console.error("checkIsFollowing error:", err);
      return false;
    }
  }, []);

  // ── Get follower count for an address ──────────────────────────
  const getFollowerCount = useCallback(async (address) => {
    try {
      const contract = getReadOnlyContract("SocialGraph", getProvider());
      const count = await contract.getFollowerCount(address);
      return Number(count);
    } catch (err) {
      console.error("getFollowerCount error:", err);
      return 0;
    }
  }, []);

  // ── Get following count for an address ─────────────────────────
  const getFollowingCount = useCallback(async (address) => {
    try {
      const contract = getReadOnlyContract("SocialGraph", getProvider());
      const count = await contract.getFollowingCount(address);
      return Number(count);
    } catch (err) {
      console.error("getFollowingCount error:", err);
      return 0;
    }
  }, []);

  // ── Get full list of addresses a user follows ──────────────────
  const getFollowing = useCallback(async (address) => {
    try {
      const contract = getReadOnlyContract("SocialGraph", getProvider());
      return await contract.getFollowing(address);
    } catch (err) {
      console.error("getFollowing error:", err);
      return [];
    }
  }, []);

  // ── Follow a user ──────────────────────────────────────────────
  const follow = useCallback(async (followeeAddress, signer) => {
    resetTx();
    setIsLoading(true);
    try {
      setTxStatus("waiting");
      const contract = getWritableContract("SocialGraph", signer);
      const tx = await contract.follow(followeeAddress);

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

  // ── Unfollow a user ────────────────────────────────────────────
  const unfollow = useCallback(async (followeeAddress, signer) => {
    resetTx();
    setIsLoading(true);
    try {
      setTxStatus("waiting");
      const contract = getWritableContract("SocialGraph", signer);
      const tx = await contract.unfollow(followeeAddress);

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
    checkIsFollowing,
    getFollowerCount,
    getFollowingCount,
    getFollowing,
    follow,
    unfollow,
  };
}