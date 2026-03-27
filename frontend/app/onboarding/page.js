"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import UsernameForm from "@/components/UsernameForm";
import WalletConnect from "@/components/WalletConnect";

export default function OnboardingPage() {
  const router = useRouter();
  const { address, signer, isConnected, isOnSepolia } = useWallet();
  const { checkIsRegistered, getUsername } = useUserRegistry();
  const [checking, setChecking] = useState(true);

  // ── On wallet connect: check if already registered ───────────────
  useEffect(() => {
    if (!isConnected || !address) {
      setChecking(false);
      return;
    }

    async function checkRegistration() {
      setChecking(true);
      const registered = await checkIsRegistered(address);
      if (registered) {
        // Already has a username → go straight to feed
        router.push("/feed");
      } else {
        setChecking(false);
      }
    }

    checkRegistration();
  }, [isConnected, address, checkIsRegistered, router]);

  // ── After successful registration → go to feed ───────────────────
  const handleSuccess = (username) => {
    router.push("/feed");
  };

  // ── Loading state ────────────────────────────────────────────────
  if (checking && isConnected) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Checking your wallet...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">

      {/* Background blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-700/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <span className="text-xl font-black text-white">L</span>
          </div>
          <h1 className="text-3xl font-black text-white">Join Loopin</h1>
          <p className="text-gray-400 text-center text-sm">
            Connect your wallet and claim your on-chain username
          </p>
        </div>

        {/* Card */}
        <div className="card flex flex-col gap-6">

          {/* Step 1 — Connect Wallet */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isConnected && isOnSepolia
                  ? "bg-green-500 text-white"
                  : "bg-gray-700 text-gray-300"}`}>
                {isConnected && isOnSepolia ? "✓" : "1"}
              </span>
              <span className="text-sm font-semibold text-gray-200">
                Connect your wallet
              </span>
            </div>

            {!isConnected || !isOnSepolia ? (
              <div className="pl-8">
                <WalletConnect />
              </div>
            ) : (
              <div className="pl-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  Wallet connected on Sepolia
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800" />

          {/* Step 2 — Choose Username */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isConnected && isOnSepolia
                  ? "bg-brand-600 text-white"
                  : "bg-gray-800 text-gray-600"}`}>
                2
              </span>
              <span className={`text-sm font-semibold
                ${isConnected && isOnSepolia ? "text-gray-200" : "text-gray-600"}`}>
                Choose your username
              </span>
            </div>

            <div className="pl-8">
              {isConnected && isOnSepolia ? (
                <UsernameForm signer={signer} onSuccess={handleSuccess} />
              ) : (
                <p className="text-gray-600 text-sm">
                  Connect your wallet first to continue.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Your username is stored permanently on Ethereum Sepolia.{" "}
          <br />A small gas fee (test ETH) is required.
        </p>

      </div>
    </main>
  );
}