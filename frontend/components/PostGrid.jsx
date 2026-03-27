"use client";

import { ipfsToUrl } from "@/lib/constants";
import { useState } from "react";

// Formats a Unix timestamp into a relative time string
function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60)   return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function PostTile({ post }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = ipfsToUrl(post.ipfsHash);

  return (
    <div className="group relative aspect-square bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-brand-600 transition-colors cursor-pointer">

      {/* Image */}
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={post.caption || "Post"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        /* Fallback tile when image fails to load */
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
          <span className="text-3xl">📷</span>
          <p className="text-xs text-gray-500 text-center line-clamp-3 leading-relaxed">
            {post.caption || "No caption"}
          </p>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
        <p className="text-white text-xs font-medium line-clamp-2 leading-relaxed">
          {post.caption}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {timeAgo(post.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function PostGrid({ posts, isLoading, isOwnProfile }) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-800 rounded-xl border border-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-gray-800 rounded-2xl">
        <span className="text-5xl opacity-30">📷</span>
        <div className="text-center">
          <p className="text-gray-400 font-medium">No posts yet</p>
          <p className="text-gray-600 text-sm mt-1">
            {isOwnProfile
              ? "Share your first moment on Loopin."
              : "This user hasn't posted yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {posts.map((post) => (
        <PostTile key={post.id} post={post} />
      ))}
    </div>
  );
}