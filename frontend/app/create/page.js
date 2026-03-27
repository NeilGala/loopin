"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import { useState } from "react";
import CreatePostForm from "@/components/CreatePostForm";

export default function CreatePage() {
  const router = useRouter();
  const { address, signer, isConnected, isInitialized } = useWallet();
  const { checkIsRegistered } = useUserRegistry();
  const [checking, setChecking] = useState(true);

  // ── Guard: must be connected and registered ──────────────────────
  useEffect(() => {
    if (!isInitialized) return;

    if (!isConnected) {
      router.push("/");
      return;
    }

    async function check() {
      const registered = await checkIsRegistered(address);
      if (!registered) {
        router.push("/onboarding");
        return;
      }
      setChecking(false);
    }

    check();
  }, [isInitialized, isConnected, address, checkIsRegistered, router]);

  if (!isInitialized || checking) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Top navigation bar */}
      <nav className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
  <button
    onClick={() => router.back()}
    className="text-gray-400 hover:text-white transition-colors p-1 text-sm"
  >
    ← Back
  </button>
  <span className="text-white font-bold">New Post</span>
</nav>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-black text-white">Share a moment</h1>
          <p className="text-gray-400 text-sm">
            Your post is stored permanently on IPFS and Ethereum Sepolia.
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <CreatePostForm
            signer={signer}
            authorAddress={address}
          />
        </div>

      </div>
    </main>
  );
}