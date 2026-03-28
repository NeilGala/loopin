"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import { useMessages } from "@/hooks/useMessages";
import ConversationListItem from "@/components/ConversationList";
import Navbar from "@/components/Navbar";

export default function MessagesPage() {
  const router = useRouter();
  const { address, isConnected, isInitialized, disconnect } = useWallet();
  const { getUsername } = useUserRegistry();
  const { conversations, isLoadingInbox } = useMessages(address);

  const [username,  setUsername]  = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // username map for conversation list items
  const [usernameMap, setUsernameMap] = useState({});

  // ── Auth guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isInitialized) return;
    if (!isConnected) { router.push("/"); return; }

    async function init() {
      const name = await getUsername(address);
      if (!name) { router.push("/onboarding"); return; }
      setUsername(name);
      setAuthReady(true);
    }
    init();
  }, [isInitialized, isConnected, address, getUsername, router]);

  // ── Resolve usernames for each conversation partner ────────────
  useEffect(() => {
    if (!conversations.length) return;

    async function resolveUsernames() {
      const map = { ...usernameMap };
      await Promise.all(
        conversations.map(async ({ otherId }) => {
          if (map[otherId]) return;
          const name = await getUsername(otherId);
          if (name) map[otherId] = name;
        })
      );
      setUsernameMap(map);
    }

    resolveUsernames();
  }, [conversations, getUsername]);

  if (!isInitialized || !authReady) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Navbar username={username} address={address} onDisconnect={disconnect} />

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-white">Messages</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Your private conversations
            </p>
          </div>
          <button
            onClick={() => router.push("/search")}
            className="btn-secondary text-sm px-4 py-2"
          >
            + New DM
          </button>
        </div>

        {/* Loading */}
        {isLoadingInbox && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-800 flex-shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3.5 bg-gray-800 rounded w-32" />
                  <div className="h-3 bg-gray-800 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingInbox && conversations.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-800 border border-gray-700 flex items-center justify-center">
              <span className="text-4xl opacity-60">💬</span>
            </div>
            <div>
              <p className="text-white font-bold">No messages yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Search for a user and start a conversation.
              </p>
            </div>
            <button
              onClick={() => router.push("/search")}
              className="btn-primary"
            >
              Find Users
            </button>
          </div>
        )}

        {/* Conversations list */}
        {!isLoadingInbox && conversations.length > 0 && (
          <div className="flex flex-col gap-1">
            {conversations.map(({ otherId, lastMessage }) => (
              <ConversationListItem
                key={otherId}
                otherId={otherId}
                lastMessage={lastMessage}
                username={usernameMap[otherId]}
                currentAddress={address}
              />
            ))}
          </div>
        )}

        {/* Off-chain note */}
        <p className="text-xs text-gray-700 text-center mt-8">
          💡 Messages are stored off-chain on Supabase for speed and low cost.
          <br />Only wallet addresses are visible to other users.
        </p>
      </div>
    </main>
  );
}