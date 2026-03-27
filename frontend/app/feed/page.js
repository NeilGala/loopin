"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";

export default function FeedPage() {
  const router = useRouter();
  const { address, isConnected, isInitialized, disconnect } = useWallet();
  const { getUsername } = useUserRegistry();
  const [username, setUsername] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isConnected) {
      router.push("/");
      return;
    }

    async function load() {
      const name = await getUsername(address);
      if (!name) {
        router.push("/onboarding");
        return;
      }
      setUsername(name);
      setLoading(false);
    }

    load();
  }, [isInitialized, isConnected, address, getUsername, router]);

  if (!isInitialized || loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Top navigation bar */}
      <nav className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-xs font-black text-white">L</span>
          </div>
          <span className="font-black text-white">Loopin</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/profile/${address}`)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
          >
            👤 @{username}
          </button>
          <button
            onClick={disconnect}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-3 py-1.5"
          >
            Disconnect
          </button>
        </div>
      </nav>

      {/* Feed body */}
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center gap-6">

        <div className="card w-full text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Welcome, @{username}!
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              You're registered on Loopin.
            </p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-5 py-3 text-sm text-gray-400 w-full">
            📸 Post creation and the full feed are coming in the next steps.
          </div>
        </div>

        {/* Quick link to own profile */}
        <button
          onClick={() => router.push(`/profile/${address}`)}
          className="btn-primary w-full"
        >
          View My Profile →
        </button>

        <p className="text-xs text-gray-600 text-center">
          ⛓️ Your username lives permanently on Ethereum Sepolia
        </p>
      </div>
    </main>
  );
}