"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface UserState {
  username: string | null;
  isAuthenticated: boolean;
  login: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserState | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { connected, publicKey } = useWallet();
  const [username, setUsername] = useState<string | null>(null);

  // Check LocalStorage on load
  useEffect(() => {
    const storedName = localStorage.getItem("denova_username");
    if (storedName) setUsername(storedName);
  }, []);

  // If wallet disconnects, log them out automatically
  useEffect(() => {
    if (!connected) {
      setUsername(null);
      localStorage.removeItem("denova_username");
    }
  }, [connected]);

  const login = (name: string) => {
    setUsername(name);
    localStorage.setItem("denova_username", name);
  };

  const logout = () => {
    setUsername(null);
    localStorage.removeItem("denova_username");
  };

  return (
    <UserContext.Provider 
      value={{ 
        username, 
        isAuthenticated: !!username && connected, // Must have name AND wallet
        login, 
        logout 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};