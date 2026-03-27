"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { getReadOnlyContract } from "@/lib/contracts";
import { FETCH_BATCH_SIZE, FEED_PAGE_SIZE } from "@/lib/constants";

export function useFeed() {
  const [posts,        setPosts]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(0);
  const [hasMore,      setHasMore]      = useState(false);
  const [allPosts,     setAllPosts]     = useState([]); // full sorted list

  const getProvider = () =>
    new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);

  // ── Batch fetcher: reads N posts in parallel, then waits ─────────
  // Prevents hammering Alchemy's free tier rate limit
  async function batchFetchPosts(contract, postIds) {
    const results = [];

    for (let i = 0; i < postIds.length; i += FETCH_BATCH_SIZE) {
      const batch = postIds.slice(i, i + FETCH_BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (id) => {
          try {
            const post = await contract.getPost(id);
            return {
              id:        Number(post.id),
              author:    post.author,
              ipfsHash:  post.ipfsHash,
              caption:   post.caption,
              timestamp: Number(post.timestamp),
            };
          } catch {
            return null; // silently skip failed reads
          }
        })
      );

      results.push(...batchResults.filter(Boolean));

      // Small delay between batches to respect free tier rate limits
      if (i + FETCH_BATCH_SIZE < postIds.length) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    return results;
  }

  // ── Load usernames for a list of addresses ───────────────────────
  async function batchFetchUsernames(userRegistryContract, addresses) {
    const usernameMap = {};

    await Promise.all(
      addresses.map(async (addr) => {
        try {
          const username = await userRegistryContract.getUsername(addr);
          usernameMap[addr.toLowerCase()] = username || shortAddr(addr);
        } catch {
          usernameMap[addr.toLowerCase()] = shortAddr(addr);
        }
      })
    );

    return usernameMap;
  }

  function shortAddr(addr) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  // ── Main feed loader ─────────────────────────────────────────────
  const loadFeed = useCallback(async (userAddress) => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);
    setPosts([]);
    setAllPosts([]);
    setPage(0);

    try {
      const provider         = getProvider();
      const socialGraph      = getReadOnlyContract("SocialGraph",    provider);
      const postRegistry     = getReadOnlyContract("PostRegistry",   provider);
      const userRegistry     = getReadOnlyContract("UserRegistry",   provider);

      // Step 1: Get the list of addresses this user follows
      const followingList = await socialGraph.getFollowing(userAddress);

      if (!followingList || followingList.length === 0) {
        setPosts([]);
        setAllPosts([]);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      // Step 2: For each followed address, get their post IDs
      const postIdsByAuthor = await Promise.all(
        followingList.map(async (addr) => {
          try {
            const ids = await postRegistry.getUserPostIds(addr);
            return { addr, ids: ids.map(Number) };
          } catch {
            return { addr, ids: [] };
          }
        })
      );

      // Step 3: Flatten all post IDs into one list
      const allPostIds = postIdsByAuthor.flatMap(({ ids }) => ids);

      if (allPostIds.length === 0) {
        setPosts([]);
        setAllPosts([]);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      // Step 4: Fetch full post data in batches
      const fetchedPosts = await batchFetchPosts(postRegistry, allPostIds);

      // Step 5: Fetch usernames for all authors in parallel
      const authorAddresses = [...new Set(fetchedPosts.map((p) => p.author))];
      const usernameMap     = await batchFetchUsernames(userRegistry, authorAddresses);

      // Step 6: Attach username to each post + sort newest first
      const enrichedPosts = fetchedPosts
        .map((post) => ({
          ...post,
          authorUsername: usernameMap[post.author.toLowerCase()] || shortAddr(post.author),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      // Step 7: Store the full sorted list, show first page
      setAllPosts(enrichedPosts);
      setPosts(enrichedPosts.slice(0, FEED_PAGE_SIZE));
      setHasMore(enrichedPosts.length > FEED_PAGE_SIZE);
      setPage(1);

    } catch (err) {
      console.error("Feed load error:", err);
      setError("Failed to load feed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Load more posts (pagination) ─────────────────────────────────
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const nextPage  = page + 1;
    const start     = page * FEED_PAGE_SIZE;
    const end       = start + FEED_PAGE_SIZE;
    const nextPosts = allPosts.slice(start, end);

    // Small artificial delay so the spinner is visible (feels more natural)
    setTimeout(() => {
      setPosts((prev) => [...prev, ...nextPosts]);
      setPage(nextPage);
      setHasMore(end < allPosts.length);
      setIsLoadingMore(false);
    }, 400);
  }, [page, allPosts, hasMore, isLoadingMore]);

  // ── Refresh the feed ─────────────────────────────────────────────
  const refresh = useCallback((userAddress) => {
    loadFeed(userAddress);
  }, [loadFeed]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount: allPosts.length,
    loadFeed,
    loadMore,
    refresh,
  };
}