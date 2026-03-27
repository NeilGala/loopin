"use client";

import { useRouter } from "next/navigation";

export default function FeedEmpty({ currentAddress }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-6 py-16 px-4 text-center">

      {/* Illustration */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gray-800 border border-gray-700
                        flex items-center justify-center">
          <span className="text-4xl opacity-60">👥</span>
        </div>
        {/* Small decorative circles */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-600/20
                        border border-brand-600/30 flex items-center justify-center">
          <span className="text-sm">+</span>
        </div>
      </div>

      {/* Text */}
      <div className="max-w-xs">
        <h2 className="text-xl font-black text-white">
          Your feed is empty
        </h2>
        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
          Follow other users to see their posts here.
          Your on-chain social graph is waiting to be built.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push(`/profile/${currentAddress}`)}
          className="btn-primary w-full"
        >
          View My Profile
        </button>
        <button
          onClick={() => router.push("/create")}
          className="btn-secondary w-full"
        >
          📸 Create Your First Post
        </button>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
        💡 Share your wallet address with friends so they can visit your
        profile at{" "}
        <span className="font-mono text-gray-500">
          loopin.app/profile/{currentAddress?.slice(0, 6)}...
        </span>
      </p>
    </div>
  );
}