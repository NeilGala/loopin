import "./globals.css";

export const metadata = {
  title:       "Loopin — Your world. On-chain.",
  description: "Decentralized social network built on Ethereum Sepolia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}