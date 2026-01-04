// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "../components/AppWalletProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UserProvider } from "../context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeNova | Decentralized Bounties",
  description: "The trustless marketplace for work on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-background text-primary antialiased min-h-screen flex flex-col`}>
        <AppWalletProvider>
          <UserProvider>
            {/* 1. Navbar at the top */}
            <Navbar />
            
            {/* 2. Main Content expands to fill space */}
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            
            {/* 3. Footer always at bottom */}
            <Footer />
          </UserProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}