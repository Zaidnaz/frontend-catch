"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createBounty } from "../../utils/Program"; // Importing our function
import Link from "next/link";

export default function CreateBounty() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    reward: "",
    verifier: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the createBounty function (Mock or Real)
      const result = await createBounty(
        connection,
        wallet,
        formData.description,
        parseFloat(formData.reward),
        formData.verifier
      );

      console.log("Bounty Created:", result);
      
      // Redirect back to dashboard on success
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Creation failed:", error);
      alert("Failed to create bounty. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-secondary hover:text-white text-sm mb-4 inline-block transition-colors">
            ← Back to Mission Control
          </Link>
          <h1 className="text-3xl font-bold text-white">Broadcast New Signal</h1>
          <p className="text-secondary mt-2">Request data collection from the hunter network.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Mission Directive (Description)
            </label>
            <textarea
              required
              rows={4}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand/50 transition-colors placeholder:text-gray-700 resize-none"
              placeholder="e.g. Collect 500 images of plastic waste in urban rivers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reward Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bounty Reward (SOL)
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand/50 transition-colors"
                  placeholder="0.00"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                />
                <span className="absolute right-4 top-4 text-gray-500 font-mono text-sm">SOL</span>
              </div>
            </div>

            {/* Verifier Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Verifier ID (Public Key)
              </label>
              <input
                required
                type="text"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand/50 transition-colors font-mono text-xs"
                placeholder="Enter Verifier Wallet Address..."
                value={formData.verifier}
                onChange={(e) => setFormData({ ...formData, verifier: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-black transition-all transform active:scale-95
              ${isLoading 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-brand hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Transaction...
              </span>
            ) : (
              "Initialize Bounty Contract"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}