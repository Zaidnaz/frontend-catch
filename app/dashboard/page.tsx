"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { fetchBounties, cancelBounty, approveSolution, rejectSolution, OnChainBounty } from "../../utils/Program";
import Link from "next/link";
import BountyCard from "../../components/BountyCard";

export default function Dashboard() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<"hunt" | "create" | "validate" | "wallet">("hunt");
  const [bounties, setBounties] = useState<OnChainBounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fetch Data Loop
  useEffect(() => {
    if (!mounted) return;
    const loadData = async () => {
      try {
        const data = await fetchBounties(connection, wallet);
        setBounties(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000); // Polling every 5s
    return () => clearInterval(interval);
  }, [mounted, connection, wallet]);

  if (!mounted) return null;

  // --- FILTERS ---
  
  // 1. HUNT: Show everything that is NOT mine and is OPEN
  // (In mock mode, "You" is the mock wallet address, so we'll just show all Open ones for demo)
  const huntBounties = bounties.filter(b => b.state === "Open");

  // 2. MY CREATIONS: Everything I created
  const myBounties = bounties.filter(b => 
    b.requester === (wallet.publicKey?.toString() || "5cnwfug3v9ptMXGib2cu5ujMvNiVTkyFR7RkPiVfmf8V") 
  );

  // 3. VALIDATION QUEUE: My creations that are "Submitted" and need review
  const validationQueue = myBounties.filter(b => b.state === "Submitted");

  // 4. WALLET STATS
  const totalSpent = myBounties.reduce((acc, b) => acc + (b.rewardLamports as number || 0), 0) / 1e9;
  const totalEarned = 12.5; // Mock value for "Money Received"
  const completedTasks = 5; // Mock value for "Work Contributions"

  // --- ACTIONS ---

  const handleDelete = async (pubKey: string) => {
    if(!confirm("Are you sure you want to delete this bounty? This cannot be undone.")) return;
    await cancelBounty(connection, wallet, pubKey);
    alert("Bounty Deleted");
    // Ideally refresh data here
  };

  const handleValidation = async (bountyKey: string, approved: boolean) => {
    try {
      const bounty = bounties.find(b => b.publicKey === bountyKey);
      if (!bounty) {
        alert("Bounty not found");
        return;
      }

      if(approved) {
        await approveSolution(
          bountyKey,
          wallet,
          bounty.requester,
          bounty.solver,
          connection
        );
        alert("Approved & Paid!");
      } else {
        await rejectSolution(
          bountyKey,
          wallet,
          bounty.requester,
          bounty.solver,
          connection
        );
        alert("Rejected.");
      }
      // Refresh bounties after validation
      const data = await fetchBounties(connection, wallet);
      setBounties(data);
    } catch (error) {
      console.error("Validation error:", error);
      alert("Failed to process validation. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-white">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <div className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span className="text-xl font-bold tracking-wider text-brand">DeNova // NEXUS</span>
            
            <div className="flex gap-2">
              <NavButton active={activeTab === "hunt"} onClick={() => setActiveTab("hunt")} icon="🎯">
                Data Hunters
              </NavButton>
              <NavButton active={activeTab === "create"} onClick={() => setActiveTab("create")} icon="📡">
                My Signals
              </NavButton>
              <NavButton active={activeTab === "validate"} onClick={() => setActiveTab("validate")} icon="⚖️">
                Validation
                {validationQueue.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                    {validationQueue.length}
                  </span>
                )}
              </NavButton>
              <NavButton active={activeTab === "wallet"} onClick={() => setActiveTab("wallet")} icon="💼">
                Earnings
              </NavButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: DATA HUNTERS (The Feed) */}
        {activeTab === "hunt" && (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Global Bounty Feed</h1>
              <p className="text-secondary">Find tasks, submit data, earn crypto.</p>
            </div>
            
            {loading ? <SkeletonGrid /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {huntBounties.length === 0 ? <EmptyState msg="No active hunts available." /> : 
                  huntBounties.map(b => <BountyCard key={b.publicKey} bounty={b} />)
                }
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CREATOR DASHBOARD (History & Delete) */}
        {activeTab === "create" && (
          <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Active Signals</h2>
                <p className="text-secondary">Manage the bounties you have broadcasted.</p>
              </div>
              <Link href="/create" className="bg-brand hover:bg-brand-hover text-black font-bold py-2 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                + Create New Bounty
              </Link>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="p-4">Description</th>
                    <th className="p-4">Reward</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {myBounties.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">You haven't posted any bounties yet.</td></tr>
                  ) : (
                    myBounties.map((b) => (
                      <tr key={b.publicKey} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium truncate max-w-xs">{b.description}</td>
                        <td className="p-4 font-mono text-brand">{(Number(b.rewardLamports)/1e9).toFixed(2)} SOL</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs border ${
                            b.state === 'Open' ? 'border-brand/30 text-brand bg-brand/5' : 
                            b.state === 'Submitted' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                            'border-gray-500/30 text-gray-500'
                          }`}>
                            {b.state}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDelete(b.publicKey)}
                            className="text-red-500 hover:text-red-400 text-sm hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: VALIDATION QUEUE (Review Work) */}
        {activeTab === "validate" && (
          <div className="animate-fade-in max-w-4xl mx-auto">
             <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold">Verification Queue</h2>
              <p className="text-secondary">Review submitted data. Approve to release funds.</p>
            </div>

            <div className="space-y-4">
              {validationQueue.length === 0 ? <EmptyState msg="All caught up! No pending submissions." /> : 
                validationQueue.map((b) => (
                  <div key={b.publicKey} className="bg-surface border border-l-4 border-l-yellow-500 border-white/10 p-6 rounded-r-xl flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{b.description}</h3>
                      <div className="bg-black/40 p-3 rounded border border-white/5 text-sm font-mono text-gray-300 break-all">
                        {b.dataUrl || "https://ipfs.io/ipfs/QmExampleData..."}
                      </div>
                      <div className="mt-3 flex gap-4 text-xs text-gray-500">
                        <span>Submitted by: <span className="text-white">{b.solver || "0xHunter"}</span></span>
                        <span>Reward: <span className="text-brand">{(Number(b.rewardLamports)/1e9).toFixed(2)} SOL</span></span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center gap-3 min-w-[140px]">
                      <button 
                        onClick={() => handleValidation(b.publicKey, true)}
                        className="bg-brand text-black font-bold py-2 rounded hover:bg-brand-hover shadow-lg shadow-brand/20"
                      >
                        Approve ✓
                      </button>
                      <button 
                        onClick={() => handleValidation(b.publicKey, false)}
                        className="bg-white/5 text-red-400 border border-white/10 py-2 rounded hover:bg-red-500/10 hover:border-red-500/50"
                      >
                        Reject ✕
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* VIEW 4: WALLET & STATS */}
        {activeTab === "wallet" && (
          <div className="animate-fade-in max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Financial & Contribution Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Card 1: Money Received */}
              <div className="bg-gradient-to-br from-green-900/20 to-black border border-brand/20 p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-all"></div>
                <h3 className="text-secondary text-sm uppercase tracking-wider mb-1">Total Earnings (Received)</h3>
                <div className="text-4xl font-bold text-white">{totalEarned.toFixed(2)} <span className="text-lg text-brand">SOL</span></div>
              </div>

              {/* Card 2: Money Spent */}
              <div className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 p-8 rounded-2xl relative overflow-hidden">
                <h3 className="text-secondary text-sm uppercase tracking-wider mb-1">Total Funded (Sent)</h3>
                <div className="text-4xl font-bold text-white">{totalSpent.toFixed(2)} <span className="text-lg text-blue-400">SOL</span></div>
              </div>

               {/* Card 3: Work Contributions */}
               <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 p-8 rounded-2xl relative overflow-hidden">
                <h3 className="text-secondary text-sm uppercase tracking-wider mb-1">Tasks Completed</h3>
                <div className="text-4xl font-bold text-white">{completedTasks} <span className="text-lg text-purple-400">Missions</span></div>
              </div>
            </div>

            {/* Recent Transactions Stub */}
            <h3 className="text-xl font-bold mb-4">Transaction History</h3>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 text-center text-gray-500 italic">
              Blockchain transaction history would appear here...
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Helper Components

function NavButton({ active, onClick, icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300
        ${active 
          ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-xl animate-pulse" />)}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-2xl">
      <p className="text-gray-500">{msg}</p>
    </div>
  );
}