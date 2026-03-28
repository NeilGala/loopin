"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import AvatarUploader from "@/components/AvatarUploader";
import TransactionStatus from "@/components/TransactionStatus";

const MAX_BIO_LENGTH = 160;

export default function SettingsPage() {
  const router = useRouter();
  const { address, signer, isConnected, isInitialized, disconnect } = useWallet();
  const {
    getProfile,
    updateProfile,
    txStatus,
    txHash,
    txError,
    isLoading,
    resetTx,
  } = useUserRegistry();

  const [profile,       setProfile]       = useState(null);
  const [bio,           setBio]           = useState("");
  const [newAvatarHash, setNewAvatarHash] = useState(null);
  const [authReady,     setAuthReady]     = useState(false);
  const [saveSuccess,   setSaveSuccess]   = useState(false);

  // ── Auth guard + load current profile ──────────────────────────
  useEffect(() => {
    if (!isInitialized) return;
    if (!isConnected) { router.push("/"); return; }

    async function load() {
      const data = await getProfile(address);
      if (!data?.username) { router.push("/onboarding"); return; }
      setProfile(data);
      setBio(data.bio || "");
      setAuthReady(true);
    }
    load();
  }, [isInitialized, isConnected, address, getProfile, router]);

  // ── Watch for save success ──────────────────────────────────────
  useEffect(() => {
    if (txStatus === "success") {
      setSaveSuccess(true);
      // Redirect to profile after 2s
      setTimeout(() => router.push(`/profile/${address}`), 2000);
    }
  }, [txStatus, address, router]);

  // ── Save profile ────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    resetTx();
    setSaveSuccess(false);

    const avatarToSave = newAvatarHash ?? (profile?.avatar || "");
    await updateProfile(bio, avatarToSave, signer);
  };

  const isSubmitting =
    isLoading ||
    txStatus === "waiting" ||
    txStatus === "pending";

  const hasChanges =
    bio !== (profile?.bio || "") ||
    (newAvatarHash !== null && newAvatarHash !== (profile?.avatar || ""));

  if (!isInitialized || !authReady) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent
                        rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Nav bar */}
      <nav className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm
                      border-b border-gray-800 px-4 py-3
                      flex items-center justify-between">
        <button
          onClick={() => router.push(`/profile/${address}`)}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <span className="font-bold text-white">Edit Profile</span>
        <button
          form="settings-form"
          type="submit"
          disabled={isSubmitting || !hasChanges}
          className="text-sm font-semibold text-brand-400 hover:text-brand-300
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8 pb-24">

        <form
          id="settings-form"
          onSubmit={handleSave}
          className="flex flex-col gap-6"
        >

          {/* Avatar section */}
          <div className="card flex flex-col items-center gap-2 py-6">
            <AvatarUploader
              currentAvatarHash={profile?.avatar}
              address={address}
              onUploadComplete={(hash) => setNewAvatarHash(hash)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-600 text-center mt-1">
              JPEG, PNG, WEBP · Max 3MB
            </p>
          </div>

          {/* Profile info section */}
          <div className="card flex flex-col gap-5">

            {/* Username — read only */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">
                Username
              </label>
              <div className="input opacity-60 cursor-not-allowed flex
                              items-center gap-2 text-gray-400">
                <span className="text-gray-600">@</span>
                {profile?.username}
              </div>
              <p className="text-xs text-gray-700">
                Usernames are permanent on-chain and cannot be changed.
              </p>
            </div>

            {/* Wallet address — read only */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">
                Wallet Address
              </label>
              <div className="input opacity-60 cursor-not-allowed
                              text-gray-500 font-mono text-xs truncate">
                {address}
              </div>
            </div>

            {/* Bio — editable */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-300">
                Bio
              </label>
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value.slice(0, MAX_BIO_LENGTH))
                  }
                  placeholder="Tell the world who you are..."
                  rows={3}
                  disabled={isSubmitting}
                  className="input resize-none leading-relaxed"
                />
                <span className={`absolute bottom-3 right-3 text-xs
                  ${bio.length >= MAX_BIO_LENGTH
                    ? "text-red-400"
                    : "text-gray-600"}`}>
                  {bio.length}/{MAX_BIO_LENGTH}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction status */}
          {txStatus && (
            <TransactionStatus
              status={txStatus}
              txHash={txHash}
              error={txError}
              message={
                txStatus === "waiting"
                  ? "Confirm saving your profile on Sepolia."
                  : txStatus === "pending"
                  ? "Updating your profile on-chain..."
                  : txStatus === "success"
                  ? "Profile updated! Redirecting to your profile..."
                  : null
              }
            />
          )}

          {/* Save button — full width for mobile */}
          {!saveSuccess && (
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white
                                   border-t-transparent rounded-full animate-spin" />
                  {txStatus === "waiting"
                    ? "Waiting for MetaMask..."
                    : "Saving on-chain..."}
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          )}

          {/* Info */}
          <div className="rounded-xl bg-gray-800/40 border border-gray-800 p-4">
            <p className="text-xs text-gray-600 font-medium uppercase
                          tracking-wider mb-2">
              About on-chain profiles
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your bio and avatar hash are stored permanently on Ethereum Sepolia.
              A small gas fee (test ETH) is charged per update. Your username
              is set once and can never be changed.
            </p>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-red-900/30 p-4
                          bg-red-900/5 flex flex-col gap-3">
            <p className="text-xs text-red-800 font-semibold uppercase tracking-wider">
              Danger Zone
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">
                  Disconnect Wallet
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Sign out of Loopin on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { disconnect(); router.push("/"); }}
                className="text-sm text-red-500 hover:text-red-400
                           border border-red-900/40 hover:border-red-700
                           px-4 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}