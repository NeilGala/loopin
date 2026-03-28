"use client";

import { useRouter } from "next/navigation";
import { shortAddress, timeAgo } from "@/lib/constants";

// Gradient avatar — consistent with rest of app
function MiniAvatar({ address, size = 40 }) {
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

export default function ConversationListItem({
  otherId,
  lastMessage,
  username,
  currentAddress,
}) {
  const router  = useRouter();
  const isOwn   = lastMessage.sender === currentAddress?.toLowerCase();
  const preview = lastMessage.content.length > 45
    ? lastMessage.content.slice(0, 45) + "…"
    : lastMessage.content;

  return (
    <button
      onClick={() => router.push(`/messages/${otherId}`)}
      className="flex items-center gap-3 w-full p-3 rounded-xl
                 hover:bg-gray-800/60 transition-colors text-left
                 border border-transparent hover:border-gray-700"
    >
      <MiniAvatar address={otherId} size={44} />

      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white truncate">
            {username || shortAddress(otherId)}
          </span>
          <span className="text-xs text-gray-600 flex-shrink-0">
            {timeAgo(new Date(lastMessage.created_at).getTime() / 1000)}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {isOwn && <span className="text-gray-600">You: </span>}
          {preview}
        </p>
      </div>
    </button>
  );
}