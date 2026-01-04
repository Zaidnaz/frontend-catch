"use client";

const EVENTS = [
  { user: "8x...2b", action: "hunted", amount: "2.5 SOL", task: "Scraped 5k Images" },
  { user: "3z...9a", action: "requested", amount: "5.0 SOL", task: "Medical Dataset" },
  { user: "1q...4m", action: "verified", amount: "0.5 SOL", task: "Audio Transcription" },
  { user: "9p...8x", action: "gathered", amount: "12 SOL", task: "LiDAR Point Cloud" },
  { user: "2w...1s", action: "hunted", amount: "1.2 SOL", task: "Crypto Sentiment Data" },
  { user: "5v...3k", action: "requested", amount: "3.0 SOL", task: "Rust Documentation" },
];

export default function LiveTicker() {
  return (
    <div className="w-full bg-surface/50 border-y border-white/5 backdrop-blur-sm overflow-hidden py-3">
      <div className="flex w-max animate-scroll hover:pause">
        {[...EVENTS, ...EVENTS, ...EVENTS].map((evt, i) => (
          <div key={i} className="flex items-center gap-2 mx-8 text-sm">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-gray-400 font-mono">{evt.user}</span>
            <span className="text-secondary">{evt.action}</span>
            <span className="text-brand font-bold">{evt.amount}</span>
            <span className="text-gray-500 text-xs uppercase border border-white/10 px-1 rounded">
              {evt.task}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .hover\:pause:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}