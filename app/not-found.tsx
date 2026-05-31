import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-7xl font-bold text-white/10">404</div>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-white/50 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 transition-all px-6 py-2.5 rounded-xl font-semibold text-sm"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
