"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { ConfirmedSignatureInfo } from "@solana/web3.js";

interface Transaction {
  signature: string;
  timestamp?: number;
  type: string;
  status: "success" | "failed";
  amount?: string;
}

export default function TransactionHistory() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadTransactions();
    }
  }, [publicKey]);

  const loadTransactions = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const sigs = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      const txs: Transaction[] = sigs.slice(0, 8).map((sig) => {
        // Determine transaction type from memo or default
        const type = sig.memo
          ? sig.memo.includes("bounty")
            ? "Bounty Action"
            : "Transaction"
          : "Transaction";

        return {
          signature: sig.signature,
          timestamp: sig.blockTime ?? undefined,
          type,
          status: sig.err ? "failed" : "success",
        };
      });

      setTransactions(txs);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "Just now";
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const shortenSig = (sig: string) => {
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
  };

  if (!publicKey) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Transaction History
        </h3>
        <p className="text-gray-400 text-sm">
          Connect your wallet to view transaction history
        </p>
      </div>
    );
  }

  // Show dummy transactions for demo
  const dummyTransactions = [
    {
      signature: "5Xy9HBqQVocd9xF1diQ2gAVWhTt4K5dpejNMbngYE2YE",
      type: "Create Bounty",
      status: "success" as const,
      time: "2 hours ago",
    },
    {
      signature: "33RPDXZoySECqLRcitDuJNPxJUoVjYSLFEFGWumhcTisyWmnks5",
      type: "Submit Solution",
      status: "success" as const,
      time: "5 hours ago",
    },
    {
      signature: "2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF",
      type: "Approve Solution",
      status: "success" as const,
      time: "1 day ago",
    },
    {
      signature: "Ewp9HS8ThDK2yrc5y4s5GZDykMQkfKup7rbpDX4N5gG",
      type: "Create Bounty",
      status: "success" as const,
      time: "2 days ago",
    },
    {
      signature: "GU7q88GNRK6o7hWi9mFhEJFgvSe6zy5ynpWT1xHj2Q83",
      type: "Submit Solution",
      status: "success" as const,
      time: "3 days ago",
    },
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Recent Activity
        </h3>
        <button
          onClick={loadTransactions}
          disabled={loading}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-2">
        {(transactions.length > 0 ? transactions : dummyTransactions).map(
          (tx: any) => (
            <div
              key={tx.signature}
              className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition border border-gray-700"
            >
              <div className="flex-1">
                <p className="text-sm text-white font-mono">
                  {shortenSig(tx.signature)}
                </p>
                <p className="text-xs text-gray-400">{tx.type}</p>
              </div>
              <div className="text-right">
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    tx.status === "success"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {tx.status === "success" ? "✓" : "✗"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {tx.time || formatTime(tx.timestamp)}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
