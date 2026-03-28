"use client";

import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

const NAV_ITEMS = [
  { path: "/feed",     icon: "🏠", label: "Feed"    },
  { path: "/search",   icon: "🔍", label: "Search"  },
  { path: "/create",   icon: "➕", label: "Post"    },
  { path: "/messages", icon: "💬", label: "Messages"},
  { path: "/profile",  icon: "👤", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { address, isConnected } = useWallet();

  // Only show when logged in
  if (!isConnected) return null;

  const getPath = (item) => {
    if (item.path === "/profile" && address) {
      return `/profile/${address}`;
    }
    return item.path;
  };

  const isActive = (item) => {
    const p = getPath(item);
    if (item.path === "/profile") {
      return pathname.startsWith("/profile");
    }
    return pathname === p || pathname.startsWith(p + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                    bg-gray-950/95 backdrop-blur-sm border-t border-gray-800
                    flex items-center justify-around px-2 py-2
                    sm:hidden">  {/* Hidden on desktop — Navbar handles it */}
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          onClick={() => router.push(getPath(item))}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
            transition-all duration-200 min-w-[48px]
            ${isActive(item)
              ? "text-white"
              : "text-gray-600 hover:text-gray-400"
            }`}
        >
          <span className="text-xl leading-none">{item.icon}</span>
          <span className={`text-[10px] font-medium leading-none
            ${isActive(item) ? "text-brand-400" : "text-gray-700"}`}>
            {item.label}
          </span>
          {/* Active dot */}
          {isActive(item) && (
            <span className="w-1 h-1 rounded-full bg-brand-500 mt-0.5" />
          )}
        </button>
      ))}
    </nav>
  );
}