import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title:       "Loopin — Your world. On-chain.",
  description: "Decentralized social network built on Ethereum Sepolia.",
  keywords:    ["Web3", "social", "blockchain", "decentralized", "Ethereum"],
  openGraph: {
    title:       "Loopin",
    description: "Your world. On-chain.",
    type:        "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}