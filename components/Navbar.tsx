"use client";
import Link from "next/link";
// 1. Import dynamic from next
import dynamic from "next/dynamic";

// 2. Dynamically import the wallet button with SSR disabled
const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand flex items-center justify-center text-black font-bold">D</div>
            <span className="font-bold text-xl text-white">Catch</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-secondary hover:text-white transition-colors">Dashboard</Link>
            <Link href="/create" className="text-sm font-medium text-secondary hover:text-white transition-colors">Post Bounty</Link>
            {/* 3. Use the dynamic button */}
            <WalletMultiButton style={{ backgroundColor: '#10B981', height: '40px' }} />
          </div>
        </div>
      </div>
    </nav>
  );
}