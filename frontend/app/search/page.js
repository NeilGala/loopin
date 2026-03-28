"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import { useSearch } from "@/hooks/useSearch";
import UserSearchCard from "@/components/UserSearchCard";
import Navbar from "@/components/Navbar";

export default function SearchPage() {
  const router = useRouter();
  const { address, signer, isConnected, isInitialized, disconnect } = useWallet();
  const { getUsername }  = useUserRegistry();
  const {
    query,
    results,
    recentUsers,
    isSearching,
    isLoadingRecent,
    error,
    handleQueryChange,
    loadRecentUsers,
    updateFollowState,
  } = useSearch();

  const [username,  setUsername]  = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const inputRef = useRef(null);

  // ── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;
    if (!isConnected) { router.push("/"); return; }

    async function init() {
      const name = await getUsername(address);
      if (!name) { router.push("/onboarding"); return; }
      setUsername(name);
      setAuthReady(true);
    }
    init();
  }, [isInitialized, isConnected, address, getUsername, router]);

  // ── Load recent users once auth is ready ──────────────────────
  useEffect(() => {
    if (!authReady || !address) return;
    loadRecentUsers(address);
  }, [authReady, address, loadRecentUsers]);

  // ── Auto-focus search input on mount ──────────────────────────
  useEffect(() => {
    if (authReady) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [authReady]);

  if (!isInitialized || !authReady) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const showResults    = query.trim().length > 0;
  const showRecent     = !showResults;
  const noResults      = showResults && !isSearching && results.length === 0 && !error;

  return (
    <main className="min-h-screen bg-gray-950">

      <Navbar
        username={username}
        address={address}
        onDisconnect={disconnect}
      />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">

        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-xl font-black text-white">Search</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Find users by their exact username
          </p>
        </div>

        {/* ── Search input ── */}
        <div className="relative mb-6">
          {/* Search icon */}
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none pointer-events-none">
            🔍
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value, address)}
            placeholder="Search username..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="input pl-10 pr-10"
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={() => handleQueryChange("", address)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600
                         hover:text-gray-400 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Search results ── */}
        {showResults && (
          <div className="flex flex-col gap-1">

            {/* Searching spinner */}
            {isSearching && (
              <div className="flex items-center gap-3 px-3 py-4 text-gray-500 text-sm">
                <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Searching for @{query}...
              </div>
            )}

            {/* Error */}
            {!isSearching && error && (
              <div className="px-3 py-4 text-red-400 text-sm">{error}</div>
            )}

            {/* No results */}
            {noResults && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-4xl opacity-30">🔍</span>
                <div>
                  <p className="text-gray-400 font-medium">
                    No user found for "@{query}"
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Usernames are case-insensitive and must be exact.
                  </p>
                </div>
              </div>
            )}

            {/* Results list */}
            {!isSearching && results.length > 0 && (
              <>
                <p className="text-xs text-gray-600 uppercase tracking-wider px-1 mb-2">
                  Result
                </p>
                {results.map((user) => (
                  <UserSearchCard
                    key={user.address}
                    user={user}
                    currentAddress={address}
                    signer={signer}
                    onFollowChange={updateFollowState}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Recent / Discover users ── */}
        {showRecent && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-xs text-gray-600 uppercase tracking-wider">
                Recent on Loopin
              </p>
              {isLoadingRecent && (
                <span className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Loading skeleton for recent users */}
            {isLoadingRecent && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <RecentUserSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Recent users list */}
            {!isLoadingRecent && recentUsers.length > 0 && (
              recentUsers.map((user) => (
                <UserSearchCard
                  key={user.address}
                  user={user}
                  currentAddress={address}
                  signer={signer}
                  onFollowChange={updateFollowState}
                />
              ))
            )}

            {/* Empty state for recent users */}
            {!isLoadingRecent && recentUsers.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-4xl opacity-30">👥</span>
                <div>
                  <p className="text-gray-400 font-medium">No recent users found</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Be the first to share your profile!
                  </p>
                </div>
              </div>
            )}

            {/* Hint */}
            {!isLoadingRecent && recentUsers.length > 0 && (
              <p className="text-xs text-gray-700 text-center mt-4 px-4">
                Showing users who joined in the last 7 days on Sepolia
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Skeleton loader for recent users ──────────────────────────────
function RecentUserSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-11 h-11 rounded-full bg-gray-800 flex-shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3.5 bg-gray-800 rounded w-28" />
        <div className="h-3 bg-gray-800 rounded w-20" />
      </div>
      <div className="w-20 h-8 bg-gray-800 rounded-lg flex-shrink-0" />
    </div>
  );
}