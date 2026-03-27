"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import { useSocialGraph } from "@/hooks/useSocialGraph";
import { usePostRegistry } from "@/hooks/usePostRegistry";
import ProfileHeader from "@/components/ProfileHeader";
import PostGrid from "@/components/PostGrid";

export default function ProfilePage() {
  const params   = useParams();
  const router   = useRouter();
  const viewedAddress = params.address?.toLowerCase();

  const { address: currentAddress, signer, isInitialized } = useWallet();
  const { getProfile }         = useUserRegistry();
  const { getFollowerCount, getFollowingCount } = useSocialGraph();
  const { getUserPosts }       = usePostRegistry();

  const [profile,        setProfile]        = useState(null);
  const [followerCount,  setFollowerCount]   = useState(null);
  const [followingCount, setFollowingCount]  = useState(null);
  const [posts,          setPosts]           = useState([]);
  const [loading,        setLoading]         = useState(true);
  const [postsLoading,   setPostsLoading]    = useState(true);
  const [notFound,       setNotFound]        = useState(false);

  const isOwnProfile =
    currentAddress?.toLowerCase() === viewedAddress;

  // ── Load profile data ──────────────────────────────────────────
  useEffect(() => {
    if (!viewedAddress) return;

    async function loadProfile() {
      setLoading(true);
      setNotFound(false);

      const data = await getProfile(viewedAddress);

      if (!data || !data.username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile({ ...data, address: viewedAddress });

      // Load follower/following counts in parallel
      const [followers, following] = await Promise.all([
        getFollowerCount(viewedAddress),
        getFollowingCount(viewedAddress),
      ]);

      setFollowerCount(followers);
      setFollowingCount(following);
      setLoading(false);
    }

    loadProfile();
  }, [viewedAddress, getProfile, getFollowerCount, getFollowingCount]);

  // ── Load posts separately so profile shows first ───────────────
  useEffect(() => {
    if (!viewedAddress) return;

    async function loadPosts() {
      setPostsLoading(true);
      const userPosts = await getUserPosts(viewedAddress);
      setPosts(userPosts);
      setPostsLoading(false);
    }

    loadPosts();
  }, [viewedAddress, getUserPosts]);

  // ── Not found state ────────────────────────────────────────────
  if (!loading && notFound) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 gap-6">
        <div className="text-6xl opacity-30">👤</div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Profile Not Found</h1>
          <p className="text-gray-400 mt-2 text-sm">
            This wallet address hasn't registered on Loopin yet.
          </p>
          <p className="text-gray-600 text-xs mt-1 font-mono">{viewedAddress}</p>
        </div>
        <button onClick={() => router.back()} className="btn-secondary">
          ← Go Back
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Top navigation bar */}
      <nav className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          ← Back
        </button>
        <span className="text-white font-bold truncate">
          {loading ? "Loading..." : `@${profile?.username}`}
        </span>
      </nav>

      <div className="max-w-lg mx-auto px-4 pb-24">

        {/* Profile header */}
        <div className="py-6">
          {loading ? (
            <ProfileSkeleton />
          ) : (
            <ProfileHeader
              profile={profile}
              followerCount={followerCount}
              followingCount={followingCount}
              postCount={posts.length}
              currentAddress={currentAddress}
              signer={signer}
              isOwnProfile={isOwnProfile}
              onEditProfile={() => router.push("/settings")}
            />
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-6" />

        {/* Posts section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Posts
            </h2>
            {!postsLoading && (
              <span className="text-xs text-gray-600">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            )}
          </div>

          <PostGrid
            posts={posts}
            isLoading={postsLoading}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>
    </main>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1 pt-2">
          <div className="h-5 bg-gray-800 rounded-lg w-32" />
          <div className="h-3 bg-gray-800 rounded w-24" />
          <div className="h-4 bg-gray-800 rounded w-full mt-2" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
        </div>
      </div>
      <div className="h-20 bg-gray-800 rounded-2xl" />
      <div className="h-12 bg-gray-800 rounded-xl" />
    </div>
  );
}