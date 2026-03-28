"use client";

import { useState, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { getReadOnlyContract } from "@/lib/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useSearch() {
  const [results,      setResults]      = useState([]);
  const [recentUsers,  setRecentUsers]  = useState([]);
  const [isSearching,  setIsSearching]  = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [error,        setError]        = useState(null);
  const [query,        setQuery]        = useState("");

  // Debounce timer ref
  const debounceRef = useRef(null);

  const getProvider = () =>
    new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);

  // ── Fetch a full user profile by wallet address ────────────────
  const fetchUserProfile = useCallback(async (address, userRegistry, socialGraph, currentAddress) => {
    try {
      const [username, bio, avatar, followerCount, isFollowing] = await Promise.all([
        userRegistry.getUsername(address),
        userRegistry.getBio(address),
        userRegistry.getAvatar(address),
        socialGraph.getFollowerCount(address),
        currentAddress
          ? socialGraph.isFollowing(currentAddress, address)
          : Promise.resolve(false),
      ]);

      if (!username) return null;

      return {
        address,
        username,
        bio,
        avatar,
        followerCount: Number(followerCount),
        isFollowing,
      };
    } catch {
      return null;
    }
  }, []);

  // ── Exact username search ───────────────────────────────────────
  const searchByUsername = useCallback(async (rawQuery, currentAddress) => {
    const trimmed = rawQuery.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const provider      = getProvider();
      const userRegistry  = getReadOnlyContract("UserRegistry",  provider);
      const socialGraph   = getReadOnlyContract("SocialGraph",   provider);

      // Exact match lookup
      const foundAddress = await userRegistry.getAddressByUsername(trimmed);

      // Zero address = username not registered
      if (!foundAddress || foundAddress === ZERO_ADDRESS) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      const profile = await fetchUserProfile(
        foundAddress,
        userRegistry,
        socialGraph,
        currentAddress
      );

      setResults(profile ? [profile] : []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [fetchUserProfile]);

  // ── Debounced search trigger ────────────────────────────────────
  const handleQueryChange = useCallback((value, currentAddress) => {
    setQuery(value);
    setError(null);

    // Clear previous debounce timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Set new debounce timer — fires 500ms after user stops typing
    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      searchByUsername(value, currentAddress);
    }, 500);
  }, [searchByUsername]);

  // ── Load recent registered users from contract events ──────────
  // Uses UserRegistered events from the last ~7 days of Sepolia blocks
  const loadRecentUsers = useCallback(async (currentAddress) => {
    setIsLoadingRecent(true);

    try {
      const provider     = getProvider();
      const userRegistry = getReadOnlyContract("UserRegistry",  provider);
      const socialGraph  = getReadOnlyContract("SocialGraph",   provider);

      // Get current block, query last 50,000 blocks (~7 days on Sepolia)
      const currentBlock = await provider.getBlockNumber();
      const fromBlock    = Math.max(0, currentBlock - 50000);

      // Fetch UserRegistered events
      const filter = userRegistry.filters.UserRegistered();
      const events = await userRegistry.queryFilter(filter, fromBlock, "latest");

      if (events.length === 0) {
        setRecentUsers([]);
        setIsLoadingRecent(false);
        return;
      }

      // Take the 20 most recent unique registrations
      const uniqueAddresses = [
        ...new Map(
          [...events]
            .reverse()
            .map((e) => [e.args.wallet.toLowerCase(), e.args.wallet])
        ).values(),
      ].slice(0, 20);

      // Filter out the current user's own address
      const otherAddresses = currentAddress
        ? uniqueAddresses.filter(
            (addr) => addr.toLowerCase() !== currentAddress.toLowerCase()
          )
        : uniqueAddresses;

      // Fetch profiles in parallel
      const profiles = await Promise.all(
        otherAddresses.map((addr) =>
          fetchUserProfile(addr, userRegistry, socialGraph, currentAddress)
        )
      );

      setRecentUsers(profiles.filter(Boolean));
    } catch (err) {
      console.error("Recent users error:", err);
      // Silent fail — recent users is a nice-to-have, not critical
      setRecentUsers([]);
    } finally {
      setIsLoadingRecent(false);
    }
  }, [fetchUserProfile]);

  // ── Update a single user's follow state in both lists ──────────
  // Called after a successful follow/unfollow to update UI instantly
  const updateFollowState = useCallback((targetAddress, nowFollowing) => {
    const update = (list) =>
      list.map((u) =>
        u.address.toLowerCase() === targetAddress.toLowerCase()
          ? {
              ...u,
              isFollowing:   nowFollowing,
              followerCount: nowFollowing
                ? u.followerCount + 1
                : Math.max(0, u.followerCount - 1),
            }
          : u
      );

    setResults((prev)     => update(prev));
    setRecentUsers((prev) => update(prev));
  }, []);

  return {
    query,
    results,
    recentUsers,
    isSearching,
    isLoadingRecent,
    error,
    handleQueryChange,
    loadRecentUsers,
    updateFollowState,
  };
}