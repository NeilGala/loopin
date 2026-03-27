import { NextResponse } from "next/server";

// This route runs SERVER-SIDE only.
// The Pinata secret key is never exposed to the browser.

const PINATA_API_KEY    = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_BASE_URL   = "https://api.pinata.cloud";

export async function POST(request) {

  // ── Validate env vars are set ──────────────────────────────────
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    return NextResponse.json(
      { error: "Pinata API keys not configured in .env.local" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file     = formData.get("file");
    const caption  = formData.get("caption") || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // ── Validate file type ─────────────────────────────────────
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, WEBP allowed." },
        { status: 400 }
      );
    }

    // ── Validate file size (max 10MB) ──────────────────────────
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // ── Build the Pinata FormData payload ──────────────────────
    const pinataForm = new FormData();
    pinataForm.append("file", file, file.name || "post-image");

    // Pinata metadata — helps organize your pins in the dashboard
    const metadata = JSON.stringify({
      name: `loopin-post-${Date.now()}`,
      keyvalues: {
        app:     "loopin",
        caption: caption.slice(0, 100),
      },
    });
    pinataForm.append("pinataMetadata", metadata);

    // Pinata options
    const options = JSON.stringify({ cidVersion: 1 });
    pinataForm.append("pinataOptions", options);

    // ── Call Pinata API ────────────────────────────────────────
    const pinataResponse = await fetch(
      `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
      {
        method:  "POST",
        headers: {
          pinata_api_key:        PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
        body: pinataForm,
      }
    );

    if (!pinataResponse.ok) {
      const pinataError = await pinataResponse.text();
      console.error("Pinata error:", pinataError);
      return NextResponse.json(
        { error: "Failed to upload to IPFS. Check your Pinata API keys." },
        { status: 502 }
      );
    }

    const pinataData = await pinataResponse.json();
    const ipfsHash   = pinataData.IpfsHash;

    // ── Return the IPFS hash to the client ─────────────────────
    return NextResponse.json({
      success:  true,
      ipfsHash,
      ipfsUrl:  `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    });

  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error during upload." },
      { status: 500 }
    );
  }
}

// Block non-POST methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}