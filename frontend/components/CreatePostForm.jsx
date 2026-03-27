"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import TransactionStatus from "@/components/TransactionStatus";
import { usePostRegistry } from "@/hooks/usePostRegistry";

const MAX_CAPTION_LENGTH = 280;

export default function CreatePostForm({ signer, authorAddress }) {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);

  const {
    createPost,
    txStatus,
    txHash,
    txError,
    isLoading,
    resetTx,
  } = usePostRegistry();

  // ── Step 1: Upload to IPFS ─────────────────────────────
  const uploadToIPFS = async (imageFile) => {
    setUploadStatus("uploading");
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("caption", caption);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setIpfsHash(data.ipfsHash);
      setUploadStatus("done");

      return data.ipfsHash;
    } catch (err) {
      setUploadError(err.message || "Failed to upload image to IPFS.");
      setUploadStatus("error");
      return null;
    }
  };

  // ── Step 2: Store on-chain ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setUploadError("Please select an image first.");
      return;
    }

    if (!signer) {
      setUploadError("Wallet not connected.");
      return;
    }

    resetTx();
    setIpfsHash(null);

    // Upload first
    const hash = await uploadToIPFS(file);
    if (!hash) return;

    // Store on-chain
    const result = await createPost(hash, caption, signer);

    if (result.success) {
      setTimeout(() => {
        router.push(`/profile/${authorAddress}`);
      }, 2000);
    }
  };

  const isSubmitting =
    uploadStatus === "uploading" ||
    isLoading ||
    txStatus === "waiting" ||
    txStatus === "pending";

  const isSuccess = txStatus === "success";

  // ── Button Label Logic ─────────────────────────────
  const getButtonLabel = () => {
    if (uploadStatus === "uploading") {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Uploading to IPFS...
        </span>
      );
    }

    if (txStatus === "waiting") {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Confirm in MetaMask...
        </span>
      );
    }

    if (txStatus === "pending") {
      return (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Storing on Sepolia...
        </span>
      );
    }

    return "Share Post →";
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      
      {/* Image uploader */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">
          Photo <span className="text-red-400">*</span>
        </label>
        <ImageUploader
          onFileSelect={setFile}
          disabled={isSubmitting || isSuccess}
        />
      </div>

      {/* Caption */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-300">
          Caption
          <span className="text-gray-600 font-normal ml-1">(optional)</span>
        </label>

        <div className="relative">
          <textarea
            value={caption}
            onChange={(e) =>
              setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))
            }
            placeholder="Write a caption..."
            rows={3}
            disabled={isSubmitting || isSuccess}
            className="input resize-none pr-14 leading-relaxed"
          />

          <span
            className={`absolute bottom-3 right-3 text-xs ${
              caption.length >= MAX_CAPTION_LENGTH
                ? "text-red-400"
                : "text-gray-600"
            }`}
          >
            {caption.length}/{MAX_CAPTION_LENGTH}
          </span>
        </div>
      </div>

      {/* Uploading */}
      {uploadStatus === "uploading" && (
        <div className="rounded-xl border border-brand-500/40 bg-brand-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-brand-400 font-semibold text-sm">
                Uploading to IPFS
              </p>
              <p className="text-gray-400 text-sm">
                Pinning your image on the decentralized web...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload success */}
      {uploadStatus === "done" && ipfsHash && txStatus !== "success" && (
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <div className="min-w-0">
              <p className="text-green-400 font-semibold text-sm">
                Image uploaded to IPFS
              </p>

              <p className="text-gray-500 text-xs font-mono mt-0.5 truncate">
                {ipfsHash}
              </p>

              {/* ✅ FIXED LINK */}
              <a
                href={`https://gateway.pinata.cloud/ipfs/${ipfsHash || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 text-xs mt-1 inline-block"
              >
                Preview on IPFS ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload error */}
      {uploadStatus === "error" && uploadError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">❌</span>
            <div>
              <p className="text-red-400 font-semibold text-sm">
                Upload Failed
              </p>
              <p className="text-gray-400 text-sm">{uploadError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain tx */}
      {txStatus && (
        <TransactionStatus
          status={txStatus}
          txHash={txHash}
          error={txError}
          message={
            txStatus === "waiting"
              ? "Confirm storing your post hash on Sepolia."
              : txStatus === "pending"
              ? "Saving post ownership on-chain..."
              : txStatus === "success"
              ? "Your post is live! Redirecting to your profile..."
              : null
          }
        />
      )}

      {/* Submit */}
      {!isSuccess && (
        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="btn-primary w-full"
        >
          {getButtonLabel()}
        </button>
      )}

      {/* Info */}
      {!isSubmitting && !txStatus && (
        <div className="rounded-xl bg-gray-800/40 border border-gray-800 p-4">
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">
            How this works
          </p>

          <ol className="flex flex-col gap-1.5">
            {[
              "Your image is uploaded to IPFS via Pinata (decentralized storage)",
              "Pinata returns a unique content hash (CID) for your image",
              "The CID is stored on Ethereum Sepolia — proving you own this post",
              "Anyone can verify your post's authenticity on-chain forever",
            ].map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-500"
              >
                <span className="text-brand-600 font-bold">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </form>
  );
}