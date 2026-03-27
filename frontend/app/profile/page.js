"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

export default function ProfileRedirect() {
  const router = useRouter();
  const { address, isConnected, isInitialized } = useWallet();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isConnected || !address) {
      router.push("/");
      return;
    }
    // Redirect to the dynamic address-based profile page
    router.push(`/profile/${address}`);
  }, [isInitialized, isConnected, address, router]);

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </main>
  );
}