import { NextRequest, NextResponse } from 'next/server';

interface CancelBountyRequest {
  bountyKey: string;
  wallet: string;
  transaction: string; // Base64 encoded transaction
}

export async function POST(request: NextRequest) {
  try {
    const { bountyKey, wallet, transaction } = await request.json() as CancelBountyRequest;

    console.log('Cancel bounty request:', {
      bountyKey,
      wallet,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Bounty cancellation request received. Please sign and submit the transaction.',
        bountyKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error canceling bounty:', error);
    return NextResponse.json(
      { error: 'Failed to cancel bounty' },
      { status: 500 }
    );
  }
}
