"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center
                     justify-center px-4 gap-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-900/20 border border-red-800/40
                      flex items-center justify-center">
        <span className="text-4xl">⚠️</span>
      </div>

      <div>
        <h1 className="text-2xl font-black text-white">Something went wrong</h1>
        <p className="text-gray-400 text-sm mt-2 max-w-sm">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
        <button
          onClick={() => router.push("/feed")}
          className="btn-secondary"
        >
          Go to Feed
        </button>
      </div>
    </main>
  );
}