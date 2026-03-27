"use client";

import { useCallback } from "react";
import { ethers } from "ethers";
import { getReadOnlyContract, getWritableContract } from "@/lib/contracts";
import { parseContractError } from "@/lib/errors";
import { useState } from "react";

export function usePostRegistry() {
  const [txStatus,  setTxStatus]  = useState(null);
  const [txHash,    setTxHash]    = useState(null);
  const [txError,   setTxError]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetTx = useCallback(() => {
    setTxStatus(null);
    setTxHash(null);
    setTxError(null);
  }, []);

  const getProvider = () =>
    new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);

  // ── Get all post IDs for a user ────────────────────────────────
  const getUserPostIds = useCallback(async (address) => {
    try {
      const contract = getReadOnlyContract("PostRegistry", getProvider());
      const ids = await contract.getUserPostIds(address);
      return ids.map(Number);
    } catch (err) {
      console.error("getUserPostIds error:", err);
      return [];
    }
  }, []);

  // ── Get a single post by ID ────────────────────────────────────
  const getPost = useCallback(async (postId) => {
    try {
      const contract = getReadOnlyContract("PostRegistry", getProvider());
      const post = await contract.getPost(postId);
      return {
        id:        Number(post.id),
        author:    post.author,
        ipfsHash:  post.ipfsHash,
        caption:   post.caption,
        timestamp: Number(post.timestamp),
      };
    } catch (err) {
      console.error("getPost error:", err);
      return null;
    }
  }, []);

  // ── Get all posts for a user (IDs + full data) ─────────────────
  const getUserPosts = useCallback(async (address) => {
    try {
      const ids = await getUserPostIds(address);
      if (ids.length === 0) return [];

      // Fetch all posts in parallel
      const posts = await Promise.all(ids.map((id) => getPost(id)));

      // Filter out nulls and sort newest first
      return posts
        .filter(Boolean)
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      console.error("getUserPosts error:", err);
      return [];
    }
  }, [getUserPostIds, getPost]);

  // ── Get total post count across the entire platform ────────────
  const getTotalPosts = useCallback(async () => {
    try {
      const contract = getReadOnlyContract("PostRegistry", getProvider());
      const count = await contract.getTotalPosts();
      return Number(count);
    } catch (err) {
      console.error("getTotalPosts error:", err);
      return 0;
    }
  }, []);

  // ── Create a new post (used in Step 7) ────────────────────────
  const createPost = useCallback(async (ipfsHash, caption, signer) => {
    resetTx();
    setIsLoading(true);
    try {
      setTxStatus("waiting");
      const contract = getWritableContract("PostRegistry", signer);
      const tx = await contract.createPost(ipfsHash, caption);

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
    getUserPostIds,
    getPost,
    getUserPosts,
    getTotalPosts,
    createPost,
  };
}