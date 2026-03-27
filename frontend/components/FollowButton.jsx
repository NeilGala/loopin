"use client";

import { useState, useEffect } from "react";
import { useSocialGraph } from "@/hooks/useSocialGraph";
import TransactionStatus from "@/components/TransactionStatus";

export default function FollowButton({
  targetAddress,   // wallet address of the profile being viewed
  currentAddress,  // wallet address of the logged-in user
  signer,          // signer from useWallet
}) {
  const [isFollowing,    setIsFollowing]    = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [checking,       setChecking]       = useState(true);

  const {
    follow,
    unfollow,
    checkIsFollowing,
    getFollowerCount,
    txStatus,
    txHash,
    txError,
    isLoading,
    resetTx,
  } = useSocialGraph();

  // ── Load initial follow state ────────────────────────────────────
  useEffect(() => {
    if (!targetAddress || !currentAddress) return;

    async function load() {
      setChecking(true);
      const [following, count] = await Promise.all([
        checkIsFollowing(currentAddress, targetAddress),
        getFollowerCount(targetAddress),
      ]);
      setIsFollowing(following);
      setFollowersCount(count);
      setChecking(false);
    }

    load();
  }, [targetAddress, currentAddress, checkIsFollowing, getFollowerCount]);

  // ── Optimistic UI update after tx success ───────────────────────
  useEffect(() => {
    if (txStatus === "success") {
      setIsFollowing((prev) => {
        setFollowersCount((c) => (prev ? c - 1 : c + 1));
        return !prev;
      });
    }
  }, [txStatus]);

  const handleClick = async () => {
    if (!signer) return;
    resetTx();
    if (isFollowing) {
      await unfollow(targetAddress, signer);
    } else {
      await follow(targetAddress, signer);
    }
  };

  // Don't render anything if viewing your own profile
  if (!currentAddress || !targetAddress ||
      currentAddress.toLowerCase() === targetAddress.toLowerCase()) {
    return null;
  }

  const isProcessing = isLoading ||
    txStatus === "waiting" ||
    txStatus === "pending";

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={handleClick}
        disabled={isProcessing || checking}
        className={`w-full font-semibold px-6 py-3 rounded-xl transition-all duration-200
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          ${isFollowing
            ? "bg-gray-800 hover:bg-red-900/40 border border-gray-700 hover:border-red-700 text-white hover:text-red-400"
            : "bg-brand-600 hover:bg-brand-700 text-white"
          }`}
      >
        {checking ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {txStatus === "waiting" ? "Confirm in MetaMask..." : "Processing..."}
          </span>
        ) : isFollowing ? (
          "Following ✓"
        ) : (
          "Follow"
        )}
      </button>

      {/* Show tx status below the button */}
      {(txStatus === "error" || txStatus === "success") && (
        <TransactionStatus
          status={txStatus}
          txHash={txHash}
          error={txError}
          message={
            txStatus === "success"
              ? isFollowing
                ? "You are now following this user."
                : "You have unfollowed this user."
              : null
          }
        />
      )}
    </div>
  );
}