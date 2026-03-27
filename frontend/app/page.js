"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import WalletConnect from "@/components/WalletConnect";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const { address, isConnected, isOnSepolia, isInitialized } = useWallet();
  const { checkIsRegistered } = useUserRegistry();

  useEffect(() => {
    // Wait until MetaMask state is fully read before making any routing decision
    if (!isInitialized) return;
    if (!isConnected || !isOnSepolia) return;

    async function route() {
      const registered = await checkIsRegistered(address);
      router.push(registered ? "/feed" : "/onboarding");
    }
    route();
  }, [isInitialized, isConnected, isOnSepolia, address, checkIsRegistered, router]);

  // Show a neutral loading state while MetaMask initializes
  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <span className="text-2xl font-black text-white">L</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">{APP_NAME}</h1>
        </div>

        <p className="text-gray-400 text-lg text-center max-w-sm">{APP_TAGLINE}</p>

        <div className="flex flex-wrap justify-center gap-2">
          {["📸 Share moments", "⛓️ Own your content", "👥 Follow anyone"].map((f) => (
            <span key={f} className="text-sm text-gray-400 bg-gray-800/60 border border-gray-700 px-4 py-1.5 rounded-full">
              {f}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          <WalletConnect />
          <p className="text-gray-600 text-sm">New here? You'll choose a username next.</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Running on Ethereum Sepolia Testnet
        </div>
      </div>
    </main>
  );
}