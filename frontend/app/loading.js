export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center
                        justify-center animate-pulse-slow">
          <span className="text-lg font-black text-white">L</span>
        </div>
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    </main>
  );
}