"use client";

import { useState } from "react";
import { useUserRegistry } from "@/hooks/useUserRegistry";
import TransactionStatus from "@/components/TransactionStatus";

// Username validation — mirrors the Solidity rules exactly
function validateUsername(value) {
  if (!value) return "Username is required.";
  if (value.length < 3)  return "Username must be at least 3 characters.";
  if (value.length > 20) return "Username must be 20 characters or less.";
  if (!/^[a-zA-Z0-9_]+$/.test(value))
    return "Only letters, numbers, and underscores allowed.";
  return null; // null = valid
}

export default function UsernameForm({ signer, onSuccess }) {
  const [username,    setUsername]    = useState("");
  const [fieldError,  setFieldError]  = useState(null);

  const {
    register,
    txStatus,
    txHash,
    txError,
    isLoading,
    resetTx,
  } = useUserRegistry();

  // ── Live validation as user types ──────────────────────────────
  const handleChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    if (fieldError) setFieldError(validateUsername(value));
    if (txStatus === "error") resetTx();
  };

  // ── Submit registration ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateUsername(username);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setFieldError(null);
    const result = await register(username, signer);

    if (result.success) {
      // Give the user 1.5s to see the success state, then redirect
      setTimeout(() => onSuccess(username), 1500);
    }
  };

  const isSubmitting = isLoading || txStatus === "pending" || txStatus === "waiting";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">

      {/* Username input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">
          Choose your username
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium select-none">
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={handleChange}
            placeholder="satoshi"
            maxLength={20}
            disabled={isSubmitting || txStatus === "success"}
            className="input pl-8"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          {/* Character counter */}
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600">
            {username.length}/20
          </span>
        </div>

        {/* Field-level validation error */}
        {fieldError && (
          <p className="text-red-400 text-xs">{fieldError}</p>
        )}

        {/* Username rules hint */}
        {!fieldError && (
          <p className="text-gray-600 text-xs">
            3–20 characters · letters, numbers, underscores only · lowercase only
          </p>
        )}
      </div>

      {/* Transaction status (waiting / pending / success / error) */}
      <TransactionStatus
        status={txStatus}
        txHash={txHash}
        error={txError}
        message={
          txStatus === "waiting" ? "Confirm your username registration in MetaMask." :
          txStatus === "pending" ? "Registering your username on Sepolia..." :
          txStatus === "success" ? `@${username} is yours! Taking you in...` :
          null
        }
      />

      {/* Submit button */}
      {txStatus !== "success" && (
        <button
          type="submit"
          disabled={isSubmitting || !username}
          className="btn-primary w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {txStatus === "waiting" ? "Waiting for MetaMask..." : "Registering on-chain..."}
            </span>
          ) : (
            "Claim Username →"
          )}
        </button>
      )}

    </form>
  );
}