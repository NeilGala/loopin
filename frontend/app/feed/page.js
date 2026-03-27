"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import { useFeed } from "@/hooks/useFeed";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import FeedEmpty from "@/components/FeedEmpty";
import { useState } from "react";

export default function FeedPage() {
  const router = useRouter();
  const { address, isConnected, isInitialized, disconnect } = useWallet();
  const { getUsername } = useUserRegistry();
  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    loadFeed,
    loadMore,
    refresh,
  } = useFeed();

  const [username,  setUsername]  = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Ref for the infinite scroll sentinel element
  const sentinelRef = useRef(null);

  // ── Auth guard + initial data load ──────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;

    if (!isConnected) {
      router.push("/");
      return;
    }

    async function init() {
      const name = await getUsername(address);
      if (!name) {
        router.push("/onboarding");
        return;
      }
      setUsername(name);
      setAuthReady(true);
      loadFeed(address);
    }

    init();
  }, [isInitialized, isConnected, address, getUsername, router, loadFeed]);

  // ── Infinite scroll via IntersectionObserver ─────────────────────
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, isLoading, loadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      root:       null,
      rootMargin: "200px", // start loading before user hits the bottom
      threshold:  0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  // ── Loading state ─────────────────────────────────────────────
  if (!isInitialized || !authReady) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent
                          rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your feed...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Navigation bar */}
      <Navbar
        username={username}
        address={address}
        onDisconnect={disconnect}
      />

      {/* Feed content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">

        {/* Feed header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-white">Your Feed</h1>
            {!isLoading && totalCount > 0 && (
              <p className="text-xs text-gray-600 mt-0.5">
                {totalCount} post{totalCount !== 1 ? "s" : ""} from people you follow
              </p>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => refresh(address)}
            disabled={isLoading}
            className="text-sm text-gray-500 hover:text-brand-400 transition-colors
                       disabled:opacity-40 flex items-center gap-1.5 px-3 py-1.5
                       rounded-lg hover:bg-gray-800"
          >
            <span className={isLoading ? "animate-spin inline-block" : ""}>↻</span>
            Refresh
          </button>
        </div>

        {/* ── Feed states ── */}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <FeedSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="card border-red-800/50 bg-red-900/10 text-center
                          flex flex-col items-center gap-4">
            <span className="text-4xl">⚠️</span>
            <div>
              <p className="text-red-400 font-semibold">Failed to load feed</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => refresh(address)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && posts.length === 0 && (
          <FeedEmpty currentAddress={address} />
        )}

        {/* Posts list */}
        {!isLoading && !error && posts.length > 0 && (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={`${post.id}-${post.author}`} post={post} />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {/* Loading more spinner */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-brand-500
                                border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* End of feed message */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 border
                                border-gray-700 flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <p className="text-gray-600 text-sm">You're all caught up!</p>
                <button
                  onClick={() => router.push("/create")}
                  className="text-brand-500 hover:text-brand-400 text-sm
                             transition-colors font-medium"
                >
                  Share something new →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Feed skeleton loader ────────────────────────────────────────────
function FeedSkeleton() {
  return (
    <div className="card p-0 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-gray-800 flex-shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-3.5 bg-gray-800 rounded w-28" />
          <div className="h-3 bg-gray-800 rounded w-20" />
        </div>
        <div className="h-3 bg-gray-800 rounded w-12" />
      </div>
      {/* Image placeholder */}
      <div className="w-full h-64 bg-gray-800" />
      {/* Caption */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="h-3.5 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  );
}