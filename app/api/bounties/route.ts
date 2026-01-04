import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

const PROGRAM_ID = new PublicKey('2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF');
const NETWORK = 'https://api.devnet.solana.com';

// Simple IDL interface
interface BountyAccount {
  requester: string;
  verifier: string;
  description: string;
  reward: string;
  state: { open?: {} | null; submitted?: {} | null; completed?: {} | null };
  solver: string;
  dataUrl: string;
}

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(NETWORK, 'confirmed');
    
    // Get all accounts owned by the program
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          dataSize: 8 + 32 + 32 + 200 + 8 + 2 + 32 + 200, // Space from contract
        },
      ],
    });

    const bounties = accounts.map((account) => {
      const data = account.account.data;
      
      // Parse the account data based on the contract structure
      // This is a basic parser - you may need to adjust based on actual serialization
      let offset = 8; // Skip discriminator
      
      const requester = data.slice(offset, offset + 32).toString('hex');
      offset += 32;
      
      const verifier = data.slice(offset, offset + 32).toString('hex');
      offset += 32;
      
      // Description string (4 bytes length + content)
      const descLen = data.readUInt32LE(offset);
      offset += 4;
      const description = data.slice(offset, offset + descLen).toString('utf8');
      offset += 200; // Skip allocated space
      
      const reward = data.readBigUInt64LE(offset);
      offset += 8;
      
      // State (enum: 0=Open, 1=Submitted, 2=Completed)
      const stateNum = data.readUInt8(offset);
      offset += 1;
      
      const stateName = stateNum === 0 ? 'Open' : stateNum === 1 ? 'Submitted' : 'Completed';
      
      offset += 1; // padding
      
      const solver = data.slice(offset, offset + 32).toString('hex');
      offset += 32;
      
      // Data URL string
      const urlLen = data.readUInt32LE(offset);
      offset += 4;
      const dataUrl = data.slice(offset, offset + urlLen).toString('utf8');
      
      return {
        publicKey: account.pubkey.toString(),
        requester,
        verifier,
        description,
        rewardLamports: reward.toString(),
        state: stateName,
        solver,
        dataUrl,
      };
    });

    return NextResponse.json({ bounties }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    );
  }
}
