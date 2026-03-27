"use client";

// Transaction status values:
// null       = idle (show nothing)
// "waiting"  = MetaMask popup is open, waiting for user to confirm
// "pending"  = user confirmed, tx is being mined on Sepolia
// "success"  = tx confirmed on-chain
// "error"    = something went wrong

export default function TransactionStatus({ status, txHash, message, error }) {
  if (!status) return null;

  const states = {
    waiting: {
      icon: "🦊",
      color: "border-yellow-500/40 bg-yellow-500/10",
      text: "text-yellow-400",
      title: "Check MetaMask",
      body:
        message || "Please confirm the transaction in your MetaMask popup.",
    },
    pending: {
      icon: null, // spinner
      color: "border-brand-500/40 bg-brand-500/10",
      text: "text-brand-400",
      title: "Transaction Submitted",
      body: message || "Waiting for Sepolia network confirmation...",
    },
    success: {
      icon: "✅",
      color: "border-green-500/40 bg-green-500/10",
      text: "text-green-400",
      title: "Success!",
      body: message || "Your transaction was confirmed on-chain.",
    },
    error: {
      icon: "❌",
      color: "border-red-500/40 bg-red-500/10",
      text: "text-red-400",
      title: "Transaction Failed",
      body: error || "Something went wrong. Please try again.",
    },
  };

  const state = states[status];
  if (!state) return null;

  return (
    <div
      className={`rounded-xl border p-4 ${state.color} animate-fade-in`}
    >
      <div className="flex items-start gap-3">
        {/* Icon or spinner */}
        <div className="mt-0.5 flex-shrink-0">
          {state.icon ? (
            <span className="text-xl">{state.icon}</span>
          ) : (
            <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${state.text}`}>
            {state.title}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">{state.body}</p>

          {/* Etherscan link */}
          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View transaction on Etherscan"
              className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs mt-2 transition-colors"
            >
              View on Etherscan ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}