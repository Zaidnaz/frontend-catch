import { NextRequest, NextResponse } from 'next/server';

interface ReviewBountyRequest {
  bountyKey: string;
  authority: string;
  approved: boolean;
  transaction: string; // Base64 encoded transaction
}

export async function POST(request: NextRequest) {
  try {
    const { bountyKey, authority, approved, transaction } = await request.json() as ReviewBountyRequest;

    const action = approved ? 'approve' : 'reject';
    
    console.log('Review bounty request:', {
      bountyKey,
      authority,
      action,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Bounty ${action}ed. Please sign and submit the transaction.`,
        bountyKey,
        action,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reviewing bounty:', error);
    return NextResponse.json(
      { error: 'Failed to review bounty' },
      { status: 500 }
    );
  }
}
