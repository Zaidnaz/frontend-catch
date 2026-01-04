// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MatrixBackground from "../components/MatrixBackground";
import OnboardingModal from "../components/OnboardingModal";
import InteractiveCubes from "../components/InteractiveCubes"; 
import LiveTicker from "../components/LiveTicker";
import { useUser } from "../context/UserContext";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRoute, setTargetRoute] = useState("/dashboard");
  const { isAuthenticated } = useUser();
  const router = useRouter();

  const handleAction = (route: string) => {
    if (isAuthenticated) {
      router.push(route);
    } else {
      setTargetRoute(route);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative isolate overflow-hidden bg-background">
      
      {/* Background FX */}
      <div className="absolute inset-0 h-[900px] overflow-hidden -z-20 pointer-events-none">
         <MatrixBackground />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/10 blur-[100px] rounded-full -z-10" />

      <OnboardingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        targetRoute={targetRoute}
      />

      {/* --- HERO SECTION --- */}
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-20 sm:pb-24 lg:flex lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <div className="inline-flex space-x-6">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold leading-6 text-brand ring-1 ring-inset ring-brand/20 backdrop-blur-md">
                v1.0 Live on Devnet
              </span>
            </div>
          </div>
          
          {/* UPDATED TITLE: Data Hunter Theme */}
          <h1 className="mt-10 text-5xl font-bold tracking-tight text-white sm:text-6xl glitch-wrapper">
            <span className="glitch-text" data-text="The Data Hunt">The Data Hunt</span>
            <br />
            is <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-teal-400">Open</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-secondary backdrop-blur-sm bg-background/40 p-2 rounded-lg inline-block border border-white/5">
            The AI revolution needs fuel. Gatherers request datasets; Hunters track them down.
            Verify the data, submit the payload, and get paid instantly in SOL.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => handleAction("/dashboard")}
              className="w-full sm:w-auto text-center rounded-lg bg-brand px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-brand-hover transition-all"
            >
              Start Hunting
            </button>
            <button 
              onClick={() => handleAction("/create")}
              className="w-full sm:w-auto text-center rounded-lg border border-white/10 px-6 py-3.5 text-sm font-semibold leading-6 text-white hover:bg-white/5 transition-all group flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              Request Data 
              <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Hero Visual (Code Block) */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none transform hover:scale-[1.02] transition-transform duration-500">
            <div className="rounded-xl bg-[#0F0F12]/90 backdrop-blur-md border border-border p-2 ring-1 ring-inset ring-white/10 lg:rounded-2xl lg:p-4 shadow-2xl">
               <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 mb-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/50" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                 <div className="w-3 h-3 rounded-full bg-green-500/50" />
                 <div className="ml-4 text-xs text-gray-500 font-mono">data_validation.rs</div>
               </div>
               <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
                 <div className="text-pink-500">pub fn <span className="text-blue-400">validate_payload</span>(ctx: Context&lt;Bounty&gt;) {'{'}</div>
                 <div className="pl-4 text-gray-500">// 1. Hash the dataset</div>
                 <div className="pl-4 text-white">let data_hash = hash(&ctx.accounts.submission);</div>
                 <div className="pl-4 text-white">if data_hash == required_hash {'{'}</div>
                 <div className="pl-8 text-brand">release_funds(worker, amount)?;</div>
                 <div className="pl-4 text-white">{'}'} else {'{'}</div>
                 <div className="pl-8 text-red-400">reject_submission()?;</div>
                 <div className="pl-4 text-white">{'}'}</div>
                 <div className="text-pink-500">{'}'}</div>
                 <div className="mt-4 text-green-400/50 blink">_</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <LiveTicker />

      {/* --- STATS BAR --- */}
      <div className="border-y border-white/5 bg-white/5 backdrop-blur-sm">
         <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt className="text-base leading-7 text-secondary">Data Volume Traded</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                4.2 TB <span className="text-sm text-brand font-medium align-top">DEVNET</span>
              </dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt className="text-base leading-7 text-secondary">Active Hunters</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">240+</dd>
            </div>
            <div className="mx-auto flex max-w-xs flex-col gap-y-2">
              <dt className="text-base leading-7 text-secondary">Avg. Validation Time</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">~400ms</dd>
            </div>
          </dl>
        </div>
      </div>

      <InteractiveCubes />

      {/* --- FEATURES --- */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">The Marketplace for Information</h2>
          <p className="mt-6 text-lg leading-8 text-secondary">
            Stop giving your data away for free. Hunt for requests, gather the intelligence, and get paid what it's worth.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            
            <div className="flex flex-col bg-surface p-8 rounded-2xl border border-border/50 hover:border-brand/50 transition-colors group">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-black transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                </div>
                Post Bounties
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-secondary">
                <p className="flex-auto">Need 10,000 images of street signs? Or a specific dataset for your ML model? Lock the funds and let the hunters do the work.</p>
              </dd>
            </div>

            <div className="flex flex-col bg-surface p-8 rounded-2xl border border-border/50 hover:border-brand/50 transition-colors group">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-black transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                Verify & Release
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-secondary">
                <p className="flex-auto">The smart contract holds the crypto in escrow. Funds are only released when the data integrity is verified.</p>
              </dd>
            </div>

            <div className="flex flex-col bg-surface p-8 rounded-2xl border border-border/50 hover:border-brand/50 transition-colors group">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-black transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
                </div>
                Data Sovereignty
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-secondary">
                <p className="flex-auto">A decentralized protocol means no central authority controls the flow of information. Pure peer-to-peer data exchange.</p>
              </dd>
            </div>

          </dl>
        </div>
      </div>

    </div>
  );
}