"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Navbar({ username, address, onDisconnect }) {
  const router   = useRouter();
  const pathname = usePathname();

  const navBtn = (path) =>
    `flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg
     ${pathname === path
       ? "text-white bg-gray-800"
       : "text-gray-400 hover:text-white hover:bg-gray-800"
     }`;

  return (
    <nav className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm
                    border-b border-gray-800 px-4 py-3
                    flex items-center justify-between">

      {/* Logo */}
      <button
        onClick={() => router.push("/feed")}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <span className="text-xs font-black text-white">L</span>
        </div>
        <span className="font-black text-white hidden sm:block">Loopin</span>
      </button>

      {/* Center nav */}
      <div className="flex items-center gap-1">

        <button onClick={() => router.push("/feed")}
          className={navBtn("/feed")} title="Feed">
          <span className="text-base leading-none">🏠</span>
          <span className="hidden sm:block">Feed</span>
        </button>

        <button onClick={() => router.push("/search")}
          className={navBtn("/search")} title="Search">
          <span className="text-base leading-none">🔍</span>
          <span className="hidden sm:block">Search</span>
        </button>

        <button onClick={() => router.push("/messages")}
          className={navBtn("/messages")} title="Messages">
          <span className="text-base leading-none">💬</span>
          <span className="hidden sm:block">Messages</span>
        </button>

        <button
          onClick={() => router.push("/create")}
          className="flex items-center gap-1.5 text-sm bg-brand-600
                     hover:bg-brand-700 text-white font-semibold
                     px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          title="Create Post"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:block">Post</span>
        </button>

      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button onClick={() => router.push(`/profile/${address}`)}
          className={navBtn(`/profile/${address}`)} title="My Profile">
          <span className="text-base leading-none">👤</span>
          <span className="hidden sm:block max-w-[72px] truncate">
            @{username}
          </span>
        </button>

        <button onClick={onDisconnect} title="Disconnect"
          className="text-gray-600 hover:text-gray-400 transition-colors
                     p-1.5 rounded-lg hover:bg-gray-800">
          ⏻
        </button>
      </div>
    </nav>
  );
}