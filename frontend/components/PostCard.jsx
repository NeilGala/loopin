"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ipfsToUrl, timeAgo, shortAddress } from "@/lib/constants";

// Gradient avatar
function MiniAvatar({ address, size = 36 }) {
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
      <span
        style={{
          fontSize: size * 0.4,
          color: "white",
          fontWeight: 800,
        }}
      >
        {address ? address.slice(2, 3).toUpperCase() : "?"}
      </span>
    </div>
  );
}

export default function PostCard({ post }) {
  const router = useRouter();
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const imageUrl = ipfsToUrl(post.ipfsHash);

  const goToProfile = () => {
    router.push(`/profile/${post.author}`);
  };

  return (
    <article className="card p-0 overflow-hidden flex flex-col hover:border-gray-700 transition-colors duration-200">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={goToProfile}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <MiniAvatar address={post.author} size={36} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-white leading-tight">
              @{post.authorUsername}
            </span>
            <span className="text-xs text-gray-600 leading-tight">
              {shortAddress(post.author)}
            </span>
          </div>
        </button>

        <span className="text-xs text-gray-600">
          {timeAgo(post.timestamp)}
        </span>
      </div>

      {/* Image */}
      <div className="relative bg-gray-900 w-full" style={{ minHeight: "200px" }}>
        
        {!imgLoaded && !imgErr && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <span className="text-3xl opacity-20">📷</span>
          </div>
        )}

        {imageUrl && !imgErr && (
          <img
            src={imageUrl}
            alt={post.caption || "Post"}
            className={`w-full object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ maxHeight: "500px" }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        )}

        {/* FIXED: Added missing <a> */}
        {imgErr && (
          <div className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-gray-800 border-y border-gray-700">
            <span className="text-3xl opacity-30">🖼️</span>
            <p className="text-xs text-gray-600">Image unavailable</p>

            <a
              href={`https://gateway.pinata.cloud/ipfs/${post.ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
            >
              View on IPFS ↗
            </a>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-4 py-3 flex flex-col gap-2">

        {post.caption && (
          <p className="text-sm text-gray-200 leading-relaxed">
            <span className="font-semibold text-white">
              @{post.authorUsername}
            </span>{" "}
            {post.caption}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-800 mt-1">
          <button
            onClick={goToProfile}
            className="text-xs text-gray-600 hover:text-brand-400 transition-colors"
          >
            View profile →
          </button>

          {/* FIXED: Added missing <a> */}
          <a
            href={`https://gateway.pinata.cloud/ipfs/${post.ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-700 hover:text-gray-500 transition-colors font-mono flex items-center gap-1"
          >
            ⛓️ IPFS
          </a>
        </div>
      </div>
    </article>
  );
}