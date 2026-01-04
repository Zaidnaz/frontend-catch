import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

const PROGRAM_ID = new PublicKey('2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF');
const NETWORK = 'https://api.devnet.solana.com';

interface CreateBountyRequest {
  wallet: string;
  description: string;
  rewardSol: number;
  verifier: string;
  transaction: string; // Base64 encoded transaction
}

export async function POST(request: NextRequest) {
  try {
    const { wallet, description, rewardSol, verifier, transaction } = await request.json() as CreateBountyRequest;

    const connection = new Connection(NETWORK, 'confirmed');
    
    // In a real implementation, you would:
    // 1. Deserialize the transaction
    // 2. Send it to the network
    // 3. Wait for confirmation
    
    // For now, we'll return a mock response structure
    // The client should handle creating and signing the transaction
    
    console.log('Create bounty request:', {
      wallet,
      description,
      rewardSol,
      verifier,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Bounty creation request received. Please sign and submit the transaction.',
        programId: PROGRAM_ID.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating bounty:', error);
    return NextResponse.json(
      { error: 'Failed to create bounty' },
      { status: 500 }
    );
  }
}
