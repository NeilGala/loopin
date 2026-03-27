import WalletConnect from "@/components/WalletConnect";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">

      {/* Background gradient blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Logo + Tagline */}
      <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in">

        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <span className="text-2xl font-black text-white">L</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">
            {APP_NAME}
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-gray-400 text-lg text-center max-w-sm">
          {APP_TAGLINE}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {["📸 Share moments", "⛓️ Own your content", "👥 Follow anyone"].map(
            (feature) => (
              <span
                key={feature}
                className="text-sm text-gray-400 bg-gray-800/60 border border-gray-700 px-4 py-1.5 rounded-full"
              >
                {feature}
              </span>
            )
          )}
        </div>

        {/* Wallet connect */}
        <div className="mt-4">
          <WalletConnect />
        </div>

        {/* Sepolia badge */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Running on Ethereum Sepolia Testnet
        </div>
      </div>
    </main>
  );
}