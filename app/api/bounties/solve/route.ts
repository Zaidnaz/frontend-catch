import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';

interface SolveBountyRequest {
  bountyKey: string;
  wallet: string;
  dataUrl: string;
  transaction: string; // Base64 encoded transaction
}

export async function POST(request: NextRequest) {
  try {
    const { bountyKey, wallet, dataUrl, transaction } = await request.json() as SolveBountyRequest;

    console.log('Solve bounty request:', {
      bountyKey,
      wallet,
      dataUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Bounty solution submitted. Please sign and submit the transaction.',
        bountyKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting solution:', error);
    return NextResponse.json(
      { error: 'Failed to submit solution' },
      { status: 500 }
    );
  }
}
