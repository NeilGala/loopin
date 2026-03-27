"use client";

import { useRouter } from "next/navigation";

export default function Navbar({ username, address, onDisconnect }) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center justify-between">

      {/* Logo */}
      <button
        onClick={() => router.push("/feed")}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="text-xs font-black text-white">L</span>
        </div>
        <span className="font-black text-white">Loopin</span>
      </button>

      {/* Right side actions */}
      <div className="flex items-center gap-1">

        {/* Create post */}
        <button
          onClick={() => router.push("/create")}
          className="flex items-center gap-1.5 text-sm bg-brand-600 hover:bg-brand-700
                     text-white font-semibold px-3 py-1.5 rounded-lg transition-colors
                     active:scale-95"
        >
          <span className="text-base leading-none">+</span>
          Post
        </button>

        {/* Profile link */}
        <button
          onClick={() => router.push(`/profile/${address}`)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white
                     transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
        >
          👤 <span className="max-w-[80px] truncate">@{username}</span>
        </button>

        {/* Disconnect */}
        <button
          onClick={onDisconnect}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors
                     px-2 py-1.5 rounded-lg hover:bg-gray-800"
        >
          ⏻
        </button>
      </div>
    </nav>
  );
}