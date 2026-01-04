import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, Transaction, Keypair } from '@solana/web3.js';
import { BOUNTY_IDL } from './idl';

const PROGRAM_ID = new PublicKey('2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF');
const NETWORK = 'https://api.devnet.solana.com';

/**
 * Initialize Anchor Program
 */
export const getProgram = (connection: Connection, wallet: any) => {
  // Create a wallet wrapper compatible with Anchor
  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions: wallet.signAllTransactions.bind(wallet),
  };
  
  const provider = new anchor.AnchorProvider(
    connection,
    anchorWallet as anchor.Wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  anchor.setProvider(provider);
  return new anchor.Program(BOUNTY_IDL as any, provider);
};

/**
 * Build Create Bounty Transaction
 */
export const buildCreateBountyTx = async (
  connection: Connection,
  wallet: any,
  description: string,
  rewardLamports: number,
  verifier: PublicKey
) => {
  try {
    const program = getProgram(connection, wallet);
    
    // Generate a new keypair for the bounty account
    const bountyAccount = Keypair.generate();
    
    const tx = await program.methods
      .createBounty(description, new anchor.BN(rewardLamports), verifier)
      .accounts({
        bounty: bountyAccount.publicKey,
        requester: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([bountyAccount])
      .transaction();
    
    tx.feePayer = wallet.publicKey;
    
    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    
    return {
      tx,
      bountyAccount: bountyAccount.publicKey,
      bountyKeypair: bountyAccount,
    };
  } catch (error) {
    console.error('Error building create bounty transaction:', error);
    throw error;
  }
};

/**
 * Build Solve Bounty Transaction
 */
export const buildSolveBountyTx = async (
  connection: Connection,
  wallet: any,
  bountyKey: PublicKey,
  dataUrl: string
) => {
  try {
    const program = getProgram(connection, wallet);
    
    const tx = await program.methods
      .solveBounty(dataUrl)
      .accounts({
        bounty: bountyKey,
        solver: wallet.publicKey,
      })
      .transaction();
    
    tx.feePayer = wallet.publicKey;
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    
    return tx;
  } catch (error) {
    console.error('Error building solve bounty transaction:', error);
    throw error;
  }
};

/**
 * Build Approve Solution Transaction
 */
export const buildApproveSolutionTx = async (
  connection: Connection,
  wallet: any,
  bountyKey: PublicKey,
  requesterKey: PublicKey,
  solverKey: PublicKey
) => {
  try {
    const program = getProgram(connection, wallet);
    
    const tx = await program.methods
      .approveSolution()
      .accounts({
        bounty: bountyKey,
        authority: wallet.publicKey,
        requester: requesterKey,
        solver: solverKey,
      })
      .transaction();
    
    tx.feePayer = wallet.publicKey;
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    
    return tx;
  } catch (error) {
    console.error('Error building approve solution transaction:', error);
    throw error;
  }
};

/**
 * Build Reject Solution Transaction
 */
export const buildRejectSolutionTx = async (
  connection: Connection,
  wallet: any,
  bountyKey: PublicKey,
  requesterKey: PublicKey,
  solverKey: PublicKey
) => {
  try {
    const program = getProgram(connection, wallet);
    
    const tx = await program.methods
      .rejectSolution()
      .accounts({
        bounty: bountyKey,
        authority: wallet.publicKey,
        requester: requesterKey,
        solver: solverKey,
      })
      .transaction();
    
    tx.feePayer = wallet.publicKey;
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    
    return tx;
  } catch (error) {
    console.error('Error building reject solution transaction:', error);
    throw error;
  }
};

/**
 * Build Cancel Bounty Transaction
 */
export const buildCancelBountyTx = async (
  connection: Connection,
  wallet: any,
  bountyKey: PublicKey
) => {
  try {
    const program = getProgram(connection, wallet);
    
    const tx = await program.methods
      .cancelBounty()
      .accounts({
        bounty: bountyKey,
        requester: wallet.publicKey,
      })
      .transaction();
    
    tx.feePayer = wallet.publicKey;
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    
    return tx;
  } catch (error) {
    console.error('Error building cancel bounty transaction:', error);
    throw error;
  }
};

/**
 * Sign and Send Transaction
 */
export const signAndSendTransaction = async (
  connection: Connection,
  wallet: any,
  tx: Transaction,
  additionalSigners?: Keypair[]
) => {
  try {
    // Sign with wallet
    const signedTx = await wallet.signTransaction(tx);
    
    // Add additional signers if provided
    if (additionalSigners) {
      for (const signer of additionalSigners) {
        signedTx.partialSign(signer);
      }
    }
    
    // Send transaction
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }
    
    return signature;
  } catch (error) {
    console.error('Error signing and sending transaction:', error);
    throw error;
  }
};
