// Example: Creating and Testing Bounties in DeNova

import {
  fetchBounties,
  createBounty,
  solveBounty,
  approveSolution,
  rejectSolution,
  cancelBounty,
  OnChainBounty
} from '@/utils/Program';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// ============================================
// EXAMPLE 1: Fetch and Display Bounties
// ============================================

export async function loadAllBounties() {
  const { connection } = useConnection();
  const wallet = useWallet();

  try {
    const bounties = await fetchBounties(connection, wallet);
    console.log('📋 All Bounties:');
    bounties.forEach((bounty) => {
      console.log(`
        Title: ${bounty.description}
        Reward: ${bounty.rewardLamports / 1e9} SOL
        State: ${bounty.state}
        Created by: ${bounty.requester.slice(0, 8)}...
      `);
    });
    return bounties;
  } catch (error) {
    console.error('❌ Failed to load bounties:', error);
  }
}

// ============================================
// EXAMPLE 2: Create a New Bounty
// ============================================

export async function createNewBounty() {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!wallet.connected || !wallet.publicKey) {
    alert('❌ Please connect your wallet first');
    return;
  }

  const description = 'Collect 500 high-quality photos of coffee shops in NYC';
  const rewardSol = 2.5;
  const verifierPublicKey = new PublicKey('Gov...Sec'); // Verifier's address

  try {
    console.log('📤 Creating bounty...');
    const result = await createBounty(
      connection,
      wallet,
      description,
      rewardSol,
      verifierPublicKey
    );

    console.log('✅ Bounty Created!');
    console.log(`   Public Key: ${result.publicKey}`);
    console.log(`   Signature: ${result.signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${result.signature}?cluster=devnet`);

    return result;
  } catch (error) {
    console.error('❌ Error creating bounty:', error);
    alert('Failed to create bounty. Check console for details.');
  }
}

// ============================================
// EXAMPLE 3: Submit a Solution
// ============================================

export async function submitSolutionToOpenBounty(
  bountyKey: string,
  dataUrl: string
) {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!wallet.connected || !wallet.publicKey) {
    alert('❌ Please connect your wallet first');
    return;
  }

  try {
    console.log('📤 Submitting solution...');
    const signature = await solveBounty(
      bountyKey,
      wallet,
      dataUrl,
      connection
    );

    console.log('✅ Solution Submitted!');
    console.log(`   Signature: ${signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    return signature;
  } catch (error) {
    console.error('❌ Error submitting solution:', error);
    alert('Failed to submit solution. Check console for details.');
  }
}

// EXAMPLE USAGE:
// await submitSolutionToOpenBounty(
//   "8x2...9aB",
//   "https://ipfs.io/ipfs/QmExample..."
// );

// ============================================
// EXAMPLE 4: Approve a Submitted Solution
// ============================================

export async function reviewAndApproveSolution(
  bountyKey: string,
  requesterAddress: string,
  solverAddress: string
) {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!wallet.connected || !wallet.publicKey) {
    alert('❌ Please connect your wallet first');
    return;
  }

  try {
    console.log('📤 Approving solution...');
    const signature = await approveSolution(
      bountyKey,
      wallet,
      requesterAddress,
      solverAddress,
      connection
    );

    console.log('✅ Solution Approved!');
    console.log(`   Rewards paid to solver`);
    console.log(`   Bounty account closed`);
    console.log(`   Signature: ${signature}`);

    return signature;
  } catch (error) {
    console.error('❌ Error approving solution:', error);
    alert('Failed to approve solution. Check console for details.');
  }
}

// ============================================
// EXAMPLE 5: Reject a Submitted Solution
// ============================================

export async function reviewAndRejectSolution(
  bountyKey: string,
  requesterAddress: string,
  solverAddress: string
) {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!wallet.connected || !wallet.publicKey) {
    alert('❌ Please connect your wallet first');
    return;
  }

  try {
    console.log('📤 Rejecting solution...');
    const signature = await rejectSolution(
      bountyKey,
      wallet,
      requesterAddress,
      solverAddress,
      connection
    );

    console.log('✅ Solution Rejected!');
    console.log(`   Bounty reopened for new submissions`);
    console.log(`   Signature: ${signature}`);

    return signature;
  } catch (error) {
    console.error('❌ Error rejecting solution:', error);
    alert('Failed to reject solution. Check console for details.');
  }
}

// ============================================
// EXAMPLE 6: Cancel a Bounty
// ============================================

export async function cancelOpenBounty(bountyKey: string) {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!wallet.connected || !wallet.publicKey) {
    alert('❌ Please connect your wallet first');
    return;
  }

  const confirmed = confirm(
    'Are you sure? This will cancel the bounty and refund you.'
  );
  if (!confirmed) return;

  try {
    console.log('📤 Canceling bounty...');
    const signature = await cancelBounty(
      connection,
      wallet,
      bountyKey
    );

    console.log('✅ Bounty Cancelled!');
    console.log(`   Funds refunded to your wallet`);
    console.log(`   Signature: ${signature}`);

    return signature;
  } catch (error) {
    console.error('❌ Error canceling bounty:', error);
    alert('Failed to cancel bounty. Check console for details.');
  }
}

// ============================================
// EXAMPLE 7: Real-time Dashboard Loop
// ============================================

export async function startDashboardRefresh(intervalMs = 5000) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const refreshLoop = setInterval(async () => {
    try {
      const bounties = await fetchBounties(connection, wallet);

      // Organize bounties
      const openBounties = bounties.filter(b => b.state === 'Open');
      const pendingReview = bounties.filter(b => b.state === 'Submitted');
      const completedBounties = bounties.filter(b => b.state === 'Completed');

      console.log(`
        📊 Dashboard Update:
        - Open: ${openBounties.length}
        - Pending Review: ${pendingReview.length}
        - Completed: ${completedBounties.length}
      `);

      return { openBounties, pendingReview, completedBounties };
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    }
  }, intervalMs);

  return () => clearInterval(refreshLoop); // Returns cleanup function
}

// ============================================
// EXAMPLE 8: Filter Bounties by State
// ============================================

export function filterBountiesByState(
  bounties: OnChainBounty[],
  state: 'Open' | 'Submitted' | 'Completed'
): OnChainBounty[] {
  return bounties.filter(b => b.state === state);
}

// EXAMPLE USAGE:
// const openBounties = filterBountiesByState(allBounties, 'Open');
// const pendingReview = filterBountiesByState(allBounties, 'Submitted');

// ============================================
// EXAMPLE 9: Complete Workflow
// ============================================

export async function completeWorkflow() {
  const { connection } = useConnection();
  const wallet = useWallet();

  console.log('🚀 Starting Complete Workflow...');

  try {
    // Step 1: Create a bounty
    console.log('\n1️⃣ Creating bounty...');
    const createResult = await createBounty(
      connection,
      wallet,
      'Test Data Collection',
      1.0,
      new PublicKey('Gov...Sec')
    );
    const bountyKey = createResult.publicKey;
    console.log(`✅ Created: ${bountyKey}`);

    // Step 2: Wait and fetch bounties
    console.log('\n2️⃣ Fetching bounties...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for finality
    const bounties = await fetchBounties(connection, wallet);
    const myBounty = bounties.find(b => b.publicKey === bountyKey);
    console.log(`✅ Found bounty: ${myBounty?.description}`);

    // Step 3: Submit solution
    console.log('\n3️⃣ Submitting solution...');
    const solveSignature = await solveBounty(
      bountyKey,
      wallet,
      'https://ipfs.io/ipfs/QmExample...',
      connection
    );
    console.log(`✅ Solution submitted: ${solveSignature}`);

    // Step 4: Approve solution
    console.log('\n4️⃣ Approving solution...');
    const approveSignature = await approveSolution(
      bountyKey,
      wallet,
      myBounty!.requester,
      myBounty!.solver,
      connection
    );
    console.log(`✅ Solution approved: ${approveSignature}`);

    console.log('\n🎉 Complete workflow finished!');
  } catch (error) {
    console.error('❌ Workflow error:', error);
  }
}

// ============================================
// EXAMPLE 10: Error Handling
// ============================================

export async function robustBountyCreation(
  description: string,
  rewardSol: number,
  verifier: PublicKey,
  maxRetries = 3
) {
  const { connection } = useConnection();
  const wallet = useWallet();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Attempt ${attempt}/${maxRetries}...`);
      const result = await createBounty(
        connection,
        wallet,
        description,
        rewardSol,
        verifier
      );
      console.log('✅ Success!');
      return result;
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
