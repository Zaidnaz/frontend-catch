"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { fetchBounties, solveBounty, OnChainBounty } from "@/utils/Program";

export default function BountyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const wallet = useWallet();
  const bountyId = params.id as string;

  const [bounty, setBounty] = useState<OnChainBounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBountyDetails();
  }, [bountyId]);

  const loadBountyDetails = async () => {
    try {
      setLoading(true);
      const bounties = await fetchBounties(connection, wallet);
      const found = bounties.find((b) => b.publicKey === bountyId);
      
      if (!found) {
        setError("Bounty not found");
        return;
      }
      
      setBounty(found);
    } catch (err) {
      console.error("Error loading bounty:", err);
      setError("Failed to load bounty details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    if (!dataUrl.trim()) {
      setError("Please enter a data URL");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      console.log("Submitting solution for bounty:", bountyId);
      const result = await solveBounty(bountyId, wallet, dataUrl, connection);
      
      console.log("Solution submitted:", result);
      alert("Solution submitted successfully! 🎉");
      
      // Reload bounty details
      await loadBountyDetails();
      setDataUrl("");
    } catch (err: any) {
      console.error("Error submitting solution:", err);
      setError(err.message || "Failed to submit solution");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatus = () => {
    if (!bounty) return "Unknown";
    return bounty.state;
  };

  const getStatusColor = () => {
    const status = getStatus();
    switch (status) {
      case "Open":
        return "text-green-400 bg-green-400/10";
      case "Submitted":
        return "text-yellow-400 bg-yellow-400/10";
      case "Completed":
        return "text-blue-400 bg-blue-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const canSubmit = () => {
    return (
      connected &&
      bounty &&
      bounty.state === "Open" &&
      publicKey &&
      bounty.requester !== publicKey.toString()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading bounty details...</p>
        </div>
      </div>
    );
  }

  if (error && !bounty) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Bounty Details</h1>
          <p className="text-gray-400 text-sm font-mono break-all">{bountyId}</p>
        </div>

        {bounty && (
          <div className="space-y-6">
            {/* Status & Reward - Always Visible */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor()}`}
                >
                  {getStatus()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Bounty Reward</p>
                <span className="text-3xl font-bold text-green-400">
                  {bounty.rewardLamports ? (
                    <>
                      {(BigInt(bounty.rewardLamports) / BigInt(1_000_000_000)).toString()}.
                      {String(BigInt(bounty.rewardLamports) % BigInt(1_000_000_000)).padStart(9, '0').slice(0, 2)}&nbsp;
                      <span className="text-lg text-green-300">SOL</span>
                    </>
                  ) : (
                    <>0.00 <span className="text-lg text-green-300">SOL</span></>
                  )}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{bounty.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Requester</h3>
                <p className="text-sm font-mono break-all">{bounty.requester}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Verifier</h3>
                <p className="text-sm font-mono break-all">{bounty.verifier}</p>
              </div>

              {bounty.solver && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 md:col-span-2">
                  <h3 className="text-sm text-gray-400 mb-2">Solver</h3>
                  <p className="text-sm font-mono break-all">{bounty.solver}</p>
                </div>
              )}

              {bounty.dataUrl && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 md:col-span-2">
                  <h3 className="text-sm text-gray-400 mb-2">Submitted Solution</h3>
                  <a
                    href={bounty.dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all text-sm"
                  >
                    {bounty.dataUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Submit Solution Form */}
            {canSubmit() && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Submit Your Solution</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Data URL (Link to your solution)
                    </label>
                    <input
                      type="url"
                      value={dataUrl}
                      onChange={(e) => setDataUrl(e.target.value)}
                      placeholder="https://example.com/solution"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a URL to your solution (GitHub, Google Drive, etc.)
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
                  >
                    {submitting ? "Submitting..." : "Submit Solution"}
                  </button>
                </form>
              </div>
            )}

            {/* Info Messages */}
            {!connected && (
              <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  Connect your wallet to submit a solution
                </p>
              </div>
            )}

            {connected && bounty.state === "Open" && publicKey?.toString() === bounty.requester && (
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  You created this bounty. You cannot submit a solution for your own bounty.
                </p>
              </div>
            )}

            {bounty.state === "Submitted" && (
              <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  This bounty has a pending solution awaiting review
                </p>
              </div>
            )}

            {bounty.state === "Completed" && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  This bounty has been completed and the reward has been paid
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
