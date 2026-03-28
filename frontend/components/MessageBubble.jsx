"use client";

import { timeAgo } from "@/lib/constants";

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isOwn
            ? "bg-brand-600 text-white rounded-br-md"
            : "bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-md"
          }`}
      >
        {/* Message content */}
        <p className="break-words whitespace-pre-wrap">{message.content}</p>

        {/* Timestamp */}
        <p className={`text-xs mt-1 ${isOwn ? "text-brand-200" : "text-gray-600"}`}>
          {timeAgo(new Date(message.created_at).getTime() / 1000)}
        </p>
      </div>
    </div>
  );
}