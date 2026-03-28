"use client";

import { ipfsToUrl } from "@/lib/constants";
import FollowButton from "@/components/FollowButton";
import { useRouter } from "next/navigation";



// Generates a deterministic gradient avatar from a wallet address
function GradientAvatar({ address, size = 80 }) {
  const seed = address ? address.slice(-6) : "7c3aed";
  const color1 = `#${seed}`;
  const color2 = `#${address ? address.slice(2, 8) : "a78bfa"}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: size * 0.4, color: "white", fontWeight: 800 }}>
        {address ? address.slice(2, 3).toUpperCase() : "?"}
      </span>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xl font-black text-white">
        {value ?? <span className="text-gray-600">—</span>}
      </span>
      <span className="text-xs text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default function ProfileHeader({
  profile,
  followerCount,
  followingCount,
  postCount,
  currentAddress,
  signer,
  isOwnProfile,
  onEditProfile,
}) {
  const router = useRouter();
  if (!profile) return null;

  const avatarUrl = profile.avatar ? ipfsToUrl(profile.avatar) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Top row */}
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${profile.username}'s avatar`}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <GradientAvatar address={profile.address} size={80} />
          )}

          {isOwnProfile && (
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-gray-900" />
          )}
        </div>

        {/* Username + bio */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black text-white truncate">
              @{profile.username || "unnamed"}
            </h1>

            {isOwnProfile && (
              <span className="text-xs bg-brand-600/20 text-brand-400 border border-brand-600/30 px-2 py-0.5 rounded-full">
                You
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600 font-mono">
            {profile.address
              ? `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`
              : ""}
          </p>

          {profile.bio ? (
            <p className="text-sm text-gray-300 leading-relaxed mt-1">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-gray-600 italic mt-1">
              {isOwnProfile
                ? "No bio yet — edit your profile to add one."
                : "No bio."}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-800 rounded-2xl py-4 px-2">
        <StatBox label="Posts" value={postCount} />
        <div className="w-px h-8 bg-gray-700" />
        <StatBox label="Followers" value={followerCount} />
        <div className="w-px h-8 bg-gray-700" />
        <StatBox label="Following" value={followingCount} />
      </div>

      {/* Action */}
      {isOwnProfile ? (
  <button onClick={onEditProfile} className="btn-secondary w-full">
    ✏️ Edit Profile
  </button>
) : (
  <div className="flex flex-col gap-2">
    <FollowButton
      targetAddress={profile.address}
      currentAddress={currentAddress}
      signer={signer}
    />
    <button
      onClick={() => router.push(`/messages/${profile.address}`)}
      className="btn-secondary w-full text-sm"
    >
      💬 Message
    </button>
  </div>
)}

      {/* ✅ FIXED LINK */}
      <a
        href={`https://sepolia.etherscan.io/address/${profile.address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-600 hover:text-brand-400 transition-colors text-center"
      >
        View wallet on Sepolia Etherscan ↗
      </a>
    </div>
  );
}