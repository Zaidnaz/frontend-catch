"use client";

import Link from "next/link";
// We import generic types, but we won't force 'BN' usage to avoid crashes
import { PublicKey } from "@solana/web3.js";

// ✅ FIX: Robust Helper
// Handles both Real BN (Blockchain) and Simple Numbers (Mock Data)
const formatReward = (amount: any) => {
  let value = 0;

  // Case 1: It's a BN object (Real Blockchain Data)
  if (amount && typeof amount.toNumber === "function") {
    value = amount.toNumber();
  } 
  // Case 2: It's already a number (Mock Data)
  else if (typeof amount === "number") {
    value = amount;
  }

  // Convert Lamports to SOL (1 SOL = 1,000,000,000 Lamports)
  return (value / 1_000_000_000).toFixed(2);
};

interface BountyProps {
  bounty: {
    publicKey: string;
    description: string;
    rewardLamports: any; // Allow 'any' to accept both BN and number
    state: string; 
    requester: string;
  };
}

export default function BountyCard({ bounty }: BountyProps) {
  const isCompleted = bounty.state === "Completed";
  const isOpen = bounty.state === "Open";

  return (
    <div className={`relative group p-6 rounded-xl border transition-all duration-300 
      ${isCompleted 
        ? "bg-surface/30 border-border opacity-60" 
        : "bg-surface border-border hover:border-brand/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
      }`}
    >
      {/* Top Row: Status & Reward */}
      <div className="flex justify-between items-start mb-4">
        <div className={`px-2 py-1 rounded text-xs font-mono border uppercase tracking-wide
          ${isOpen ? "bg-brand/10 text-brand border-brand/20" : ""}
          ${bounty.state === "Submitted" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : ""}
          ${isCompleted ? "bg-gray-500/10 text-gray-500 border-gray-500/20" : ""}
        `}>
          {bounty.state}
        </div>
        <div className="text-right">
          {/* ✅ FIX: formatting called here safely */}
          <div className="text-xl font-bold text-white">{formatReward(bounty.rewardLamports)} SOL</div>
          <div className="text-xs text-secondary">REWARD</div>
        </div>
      </div>

      {/* Middle: Title/Description */}
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
        {bounty.description}
      </h3>

      {/* Bottom: ID & Action */}
      <div className="flex items-end justify-between mt-4 border-t border-white/5 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase">Requester ID</span>
          <span className="text-xs text-gray-400 font-mono">
            {bounty.requester.slice(0, 4)}...{bounty.requester.slice(-4)}
          </span>
        </div>

        <Link 
          href={`/bounty/${bounty.publicKey}`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${isCompleted 
              ? "bg-white/5 text-gray-500 cursor-not-allowed" 
              : "bg-brand text-black hover:bg-brand-hover"
            }`}
        >
          {isOpen ? "View Details" : "Inspect"}
        </Link>
      </div>
    </div>
  );
}