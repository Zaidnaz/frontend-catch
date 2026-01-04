import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import {
  buildCreateBountyTx,
  buildSolveBountyTx,
  buildApproveSolutionTx,
  buildRejectSolutionTx,
  buildCancelBountyTx,
  signAndSendTransaction,
} from './transactionBuilder';

// --- TYPES (Keep these so the UI doesn't break) ---

export type OnChainBounty = {
  publicKey: string;
  requester: string;
  verifier: string;
  description: string;
  rewardLamports: any; // Using generic type to be safe
  state: 'Open' | 'Submitted' | 'Completed';
  solver: string;
  dataUrl: string;
};

// --- FALLBACK MOCK DATA (in case API fails) ---

const MOCK_BOUNTIES: OnChainBounty[] = [
  {
    publicKey: "8x2...9aB",
    requester: "5cnwfug3v9ptMXGib2cu5ujMvNiVTkyFR7RkPiVfmf8V",
    verifier: "Gov...Sec",
    description: "Collect dataset of 5000 high-res images of plastic waste in oceans.",
    rewardLamports: 1500000000, // 1.5 SOL
    state: "Open",
    solver: "",
    dataUrl: ""
  },
  {
    publicKey: "3yH...7kL",
    requester: "Corp...Inc",
    verifier: "Auto...Ver",
    description: "Verify physical location of 50 EV charging stations in downtown LA.",
    rewardLamports: 800000000, // 0.8 SOL
    state: "Completed",
    solver: "Work...99",
    dataUrl: "https://ipfs.io/ipfs/Qm..."
  },
  {
    publicKey: "9jP...2mX",
    requester: "AI...Lab",
    verifier: "Man...Chk",
    description: "Record 100 voice samples of 'Hey siri' in different accents.",
    rewardLamports: 200000000, // 0.2 SOL
    state: "Submitted",
    solver: "Usr...77",
    dataUrl: "https://arweave.net/tx..."
  }
];

// --- FETCH FROM API ---

export const fetchBounties = async (
  connection: Connection,
  wallet: any
): Promise<OnChainBounty[]> => {
  try {
    const response = await fetch('/api/bounties', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Fetched bounties from API");
    
    // Transform API response to match OnChainBounty type
    return (data.bounties || []).map((b: any) => ({
      publicKey: b.publicKey,
      requester: b.requester,
      verifier: b.verifier,
      description: b.description,
      rewardLamports: b.rewardLamports,
      state: b.state,
      solver: b.solver,
      dataUrl: b.dataUrl,
    }));
  } catch (error) {
    console.error("❌ Error fetching from API, falling back to mock data:", error);
    // Fall back to mock data
    return MOCK_BOUNTIES;
  }
};

export const createBounty = async (
  connection: Connection,
  wallet: any,
  description: string,
  rewardSol: number,
  verifier: any
) => {
  try {
    console.log("📤 Creating bounty...");
    
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or does not support signing");
    }
    
    const rewardLamports = Math.floor(rewardSol * 1_000_000_000);
    const verifierKey = verifier instanceof PublicKey ? verifier : new PublicKey(verifier);
    
    // Build transaction
    const { tx, bountyAccount, bountyKeypair } = await buildCreateBountyTx(
      connection,
      wallet,
      description,
      rewardLamports,
      verifierKey
    );
    
    // Sign and send (pass bountyKeypair as additional signer)
    const signature = await signAndSendTransaction(connection, wallet, tx, [bountyKeypair]);
    
    console.log("✅ Bounty created:", {
      signature,
      bountyKey: bountyAccount.toString(),
    });
    
    return { 
      publicKey: bountyAccount.toString(),
      signature,
    };
  } catch (error) {
    console.error("❌ Error creating bounty:", error);
    throw error;
  }
};

export const solveBounty = async (
  bountyKey: string,
  wallet: any,
  dataUrl: string,
  connection: Connection
) => {
  try {
    console.log("📤 Submitting solution...");
    
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or does not support signing");
    }
    
    const bountyKeyPub = new PublicKey(bountyKey);
    
    // Build transaction
    const tx = await buildSolveBountyTx(
      connection,
      wallet,
      bountyKeyPub,
      dataUrl
    );
    
    // Sign and send
    const signature = await signAndSendTransaction(connection, wallet, tx);
    
    console.log("✅ Solution submitted:", signature);
    return signature;
  } catch (error) {
    console.error("❌ Error submitting solution:", error);
    throw error;
  }
};

export const approveSolution = async (
  bountyKey: string,
  authority: any,
  requesterKey?: string,
  solverKey?: string,
  connection?: Connection
) => {
  try {
    console.log("📤 Approving solution...");
    
    if (!authority.publicKey || !authority.signTransaction) {
      throw new Error("Wallet not connected or does not support signing");
    }
    
    if (!connection || !requesterKey || !solverKey) {
      throw new Error("Missing required parameters: connection, requesterKey, solverKey");
    }
    
    const bountyKeyPub = new PublicKey(bountyKey);
    const requesterKeyPub = new PublicKey(requesterKey);
    const solverKeyPub = new PublicKey(solverKey);
    
    // Build transaction
    const tx = await buildApproveSolutionTx(
      connection,
      authority,
      bountyKeyPub,
      requesterKeyPub,
      solverKeyPub
    );
    
    // Sign and send
    const signature = await signAndSendTransaction(connection, authority, tx);
    
    console.log("✅ Solution approved:", signature);
    return signature;
  } catch (error) {
    console.error("❌ Error approving solution:", error);
    throw error;
  }
};

export const rejectSolution = async (
  bountyKey: string,
  authority: any,
  requesterKey?: string,
  solverKey?: string,
  connection?: Connection
) => {
  try {
    console.log("📤 Rejecting solution...");
    
    if (!authority.publicKey || !authority.signTransaction) {
      throw new Error("Wallet not connected or does not support signing");
    }
    
    if (!connection || !requesterKey || !solverKey) {
      throw new Error("Missing required parameters: connection, requesterKey, solverKey");
    }
    
    const bountyKeyPub = new PublicKey(bountyKey);
    const requesterKeyPub = new PublicKey(requesterKey);
    const solverKeyPub = new PublicKey(solverKey);
    
    // Build transaction
    const tx = await buildRejectSolutionTx(
      connection,
      authority,
      bountyKeyPub,
      requesterKeyPub,
      solverKeyPub
    );
    
    // Sign and send
    const signature = await signAndSendTransaction(connection, authority, tx);
    
    console.log("✅ Solution rejected:", signature);
    return signature;
  } catch (error) {
    console.error("❌ Error rejecting solution:", error);
    throw error;
  }
};

export const cancelBounty = async (
  connection: Connection,
  wallet: any,
  bountyPublicKey: string
) => {
  try {
    console.log("📤 Canceling bounty...");
    
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected or does not support signing");
    }
    
    const bountyKeyPub = new PublicKey(bountyPublicKey);
    
    // Build transaction
    const tx = await buildCancelBountyTx(
      connection,
      wallet,
      bountyKeyPub
    );
    
    // Sign and send
    const signature = await signAndSendTransaction(connection, wallet, tx);
    
    console.log("✅ Bounty canceled:", signature);
    return signature;
  } catch (error) {
    console.error("❌ Error canceling bounty:", error);
    throw error;
  }
};