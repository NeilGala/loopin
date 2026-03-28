"use client";

import { useState, useRef } from "react";
import { ipfsToUrl } from "@/lib/constants";

const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB for avatars

// Gradient avatar preview (consistent with rest of app)
function GradientPreview({ address, size = 80 }) {
  const seed   = address ? address.slice(-6) : "7c3aed";
  const color1 = `#${seed}`;
  const color2 = `#${address ? address.slice(2, 8) : "a78bfa"}`;
  return (
    <div style={{
      width: size, height: size,
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: size * 0.4, color: "white", fontWeight: 800 }}>
        {address?.slice(2, 3).toUpperCase() || "?"}
      </span>
    </div>
  );
}

export default function AvatarUploader({
  currentAvatarHash,
  address,
  onUploadComplete,  // callback(ipfsHash)
  disabled,
}) {
  const [preview,    setPreview]    = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState(null);
  const [uploaded,   setUploaded]   = useState(false);
  const inputRef = useRef(null);

  const currentAvatarUrl = currentAvatarHash
    ? ipfsToUrl(currentAvatarHash)
    : null;

  const handleFile = async (file) => {
    setError(null);
    setUploaded(false);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, and WEBP allowed for avatars.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Avatar must be under 3MB.");
      return;
    }

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file",    file);
      formData.append("caption", `avatar-${address}`);

      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setUploaded(true);
      onUploadComplete(data.ipfsHash);
    } catch (err) {
      setError(err.message || "Failed to upload avatar.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Avatar preview */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700">
          {preview ? (
            <img src={preview} alt="Avatar preview"
              className="w-full h-full object-cover" />
          ) : currentAvatarUrl ? (
            <img src={currentAvatarUrl} alt="Current avatar"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <GradientPreview address={address} size={96} />
          )}
        </div>

        {/* Upload button overlay */}
        {!disabled && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full
                       bg-brand-600 hover:bg-brand-700 border-2 border-gray-950
                       text-white text-sm flex items-center justify-center
                       transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent
                               rounded-full animate-spin" />
            ) : (
              "✎"
            )}
          </button>
        )}
      </div>

      {/* Status */}
      {uploading && (
        <p className="text-brand-400 text-xs animate-pulse">
          Uploading to IPFS...
        </p>
      )}
      {uploaded && !uploading && (
        <p className="text-green-400 text-xs">✅ Avatar uploaded</p>
      )}
      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}

      {/* Click to change label */}
      {!disabled && !uploading && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs text-gray-500 hover:text-brand-400
                     transition-colors underline underline-offset-2"
        >
          {currentAvatarHash || preview ? "Change photo" : "Upload photo"}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
}