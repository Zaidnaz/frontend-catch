import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { BOUNTY_IDL } from '@/utils/idl';

const PROGRAM_ID = new PublicKey('2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF');
const NETWORK = 'https://api.devnet.solana.com';

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(NETWORK, 'confirmed');
    
    // Create anchor provider and program
    const provider = new anchor.AnchorProvider(
      connection,
      {} as any, // No wallet needed for reading
      { commitment: 'confirmed' }
    );
    
    const program = new anchor.Program(BOUNTY_IDL as any, provider);
    
    // Get all accounts owned by the program
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);

    const bounties = await Promise.all(
      accounts.map(async (account) => {
        try {
          // Use Anchor to decode the account data
          const bountyData = program.coder.accounts.decode(
            'Bounty',
            account.account.data
          );
          
          // Map state enum
          let state = 'Open';
          if (bountyData.state.submitted) state = 'Submitted';
          if (bountyData.state.completed) state = 'Completed';
          
          return {
            publicKey: account.pubkey.toString(),
            requester: bountyData.requester.toString(),
            verifier: bountyData.verifier.toString(),
            description: bountyData.description,
            rewardLamports: bountyData.reward.toString(),
            state,
            solver: bountyData.solver.toString(),
            dataUrl: bountyData.dataUrl || '',
          };
        } catch (err) {
          console.error('Error decoding account:', err);
          return null;
        }
      })
    );

    // Filter out any failed decodes
    const validBounties = bounties.filter(b => b !== null);

    return NextResponse.json({ bounties: validBounties }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    );
  }
}
