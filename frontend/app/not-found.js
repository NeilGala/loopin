import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center
                     justify-center px-4 gap-6 text-center">

      {/* Background blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px]
                        bg-brand-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center">
            <span className="text-xl font-black text-white">L</span>
          </div>
        </div>

        <div>
          <h1 className="text-6xl font-black text-white">404</h1>
          <p className="text-gray-400 text-lg mt-2">Page not found</p>
          <p className="text-gray-600 text-sm mt-1">
            This page doesn't exist on Loopin.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/feed" className="btn-primary">
            Go to Feed
          </Link>
          <Link href="/search" className="btn-secondary">
            Search Users
          </Link>
        </div>
      </div>
    </main>
  );
}