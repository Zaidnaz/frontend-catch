"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoute: string; // Where to go after login
}

export default function OnboardingModal({ isOpen, onClose, targetRoute }: OnboardingModalProps) {
  const { connected } = useWallet();
  const { login } = useUser();
  const router = useRouter();
  const [inputName, setInputName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleComplete = () => {
    if (!connected) {
      setError("Please connect your wallet first.");
      return;
    }
    if (inputName.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    // Success! Login and Redirect
    login(inputName);
    onClose();
    router.push(targetRoute);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-brand" />

        <h2 className="text-2xl font-bold text-white mb-2">Welcome to DeNova</h2>
        <p className="text-secondary mb-8">Connect your identity to start earning.</p>

        <div className="space-y-6">
          {/* Step 1: Wallet */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">1. Connect Wallet</label>
            <div className="flex justify-center bg-background p-4 rounded-lg border border-border">
              <WalletMultiButton style={{ width: '100%', justifyContent: 'center' }} />
            </div>
          </div>

          {/* Step 2: Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">2. Choose Display Name</label>
            <input 
              type="text" 
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                setError("");
              }}
              placeholder="e.g. SolanaNinja"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleComplete}
              className="flex-1 bg-brand text-black font-bold py-3 rounded-lg hover:bg-brand-hover transition-colors"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}