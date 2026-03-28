"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocialGraph } from "@/hooks/useSocialGraph";
import { ipfsToUrl, shortAddress } from "@/lib/constants";

// Gradient avatar — consistent with the rest of the app
function MiniAvatar({ address, avatarHash, size = 44 }) {
  const [imgErr, setImgErr] = useState(false);
  const avatarUrl = avatarHash ? ipfsToUrl(avatarHash) : null;

  if (avatarUrl && !imgErr) {
    return (
      <img
        src={avatarUrl}
        alt="avatar"
        onError={() => setImgErr(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }

  const seed   = address ? address.slice(-6) : "7c3aed";
  const color1 = `#${seed}`;
  const color2 = `#${address ? address.slice(2, 8) : "a78bfa"}`;

  return (
    <div style={{
      width: size, height: size,
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.38, color: "white", fontWeight: 800 }}>
        {address ? address.slice(2, 3).toUpperCase() : "?"}
      </span>
    </div>
  );
}

export default function UserSearchCard({
  user,           // { address, username, bio, avatar, followerCount, isFollowing }
  currentAddress,
  signer,
  onFollowChange, // callback(address, nowFollowing) to update parent state
}) {
  const router = useRouter();
  const { follow, unfollow } = useSocialGraph();
  const [isPending, setIsPending] = useState(false);
  const [localFollowing, setLocalFollowing] = useState(user.isFollowing);
  const [localCount, setLocalCount] = useState(user.followerCount);

  const isOwnProfile =
    currentAddress?.toLowerCase() === user.address?.toLowerCase();

  const handleFollowToggle = async (e) => {
    e.stopPropagation(); // don't navigate to profile
    if (!signer || isPending) return;

    setIsPending(true);

    const nowFollowing = !localFollowing;

    // Optimistic update
    setLocalFollowing(nowFollowing);
    setLocalCount((c) => (nowFollowing ? c + 1 : Math.max(0, c - 1)));

    const result = nowFollowing
      ? await follow(user.address, signer)
      : await unfollow(user.address, signer);

    if (!result.success) {
      // Revert on failure
      setLocalFollowing(!nowFollowing);
      setLocalCount((c) => (nowFollowing ? Math.max(0, c - 1) : c + 1));
    } else {
      // Notify parent to update its list
      onFollowChange?.(user.address, nowFollowing);
    }

    setIsPending(false);
  };

  return (
    <div
      onClick={() => router.push(`/profile/${user.address}`)}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/60
                 cursor-pointer transition-colors group border border-transparent
                 hover:border-gray-700"
    >
      {/* Avatar */}
      <MiniAvatar
        address={user.address}
        avatarHash={user.avatar}
        size={44}
      />

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold text-white truncate">
          @{user.username}
        </span>
        <span className="text-xs text-gray-600 font-mono truncate">
          {shortAddress(user.address)}
        </span>
        {user.bio ? (
          <span className="text-xs text-gray-500 truncate mt-0.5">
            {user.bio}
          </span>
        ) : null}
        <span className="text-xs text-gray-700 mt-0.5">
          {localCount} follower{localCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Follow / Unfollow button */}
      {!isOwnProfile && signer && (
        <button
          onClick={handleFollowToggle}
          disabled={isPending}
          className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-lg
            transition-all duration-200 active:scale-95
            disabled:opacity-60 disabled:cursor-not-allowed
            ${localFollowing
              ? "bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-400 border border-gray-600 hover:border-red-700"
              : "bg-brand-600 hover:bg-brand-700 text-white"
            }`}
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {localFollowing ? "..." : "..."}
            </span>
          ) : localFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}

      {/* Own profile badge */}
      {isOwnProfile && (
        <span className="flex-shrink-0 text-xs text-brand-400 bg-brand-600/10
                         border border-brand-600/20 px-3 py-1.5 rounded-lg">
          You
        </span>
      )}
    </div>
  );
}