"use client";

import { useState, useRef, useCallback } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_MB   = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUploader({ onFileSelect, disabled }) {
  const [preview,   setPreview]   = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error,     setError]     = useState(null);
  const inputRef = useRef(null);

  const validateAndSet = useCallback((file) => {
    setError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, GIF, and WEBP images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`Image must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
  }, [onFileSelect]);

  // ── File input change ──────────────────────────────────────────
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSet(file);
  };

  // ── Drag and drop ──────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSet(file);
  };

  // ── Remove image ───────────────────────────────────────────────
  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">

      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isDragging
            ? "border-brand-500 bg-brand-500/10"
            : preview
              ? "border-gray-700 bg-transparent"
              : "border-gray-700 hover:border-brand-600 bg-gray-800/40 hover:bg-brand-600/5"
          }`}
      >
        {preview ? (
          /* Image preview */
          <div className="relative">
            <img
              src={preview}
              alt="Post preview"
              className="w-full max-h-96 object-contain bg-gray-900"
            />
            {/* Remove button */}
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-white text-sm flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700">
              <span className="text-2xl">📷</span>
            </div>
            <div>
              <p className="text-gray-300 font-medium text-sm">
                {isDragging ? "Drop your image here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-gray-600 text-xs mt-1">
                JPEG, PNG, GIF, WEBP · Max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Validation error */}
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
    </div>
  );
}