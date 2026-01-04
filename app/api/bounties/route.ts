import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF');
const NETWORK = 'https://api.devnet.solana.com';

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(NETWORK, 'confirmed');
    
    console.log('Fetching accounts for program:', PROGRAM_ID.toString());
    
    // Get all accounts owned by the program
    const accounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log(`Found ${accounts.length} accounts`);

    const bounties = accounts.map((account) => {
      try {
        const data = account.account.data;
        console.log(`Processing account ${account.pubkey.toString()}, data size: ${data.length}`);
        
        if (data.length < 400) {
          console.warn(`Account data too small (${data.length} bytes), skipping`);
          return null;
        }
        
        let offset = 8; // Skip discriminator
        
        // Parse requester (PublicKey - 32 bytes)
        const requesterBytes = data.slice(offset, offset + 32);
        const requester = new PublicKey(requesterBytes).toString();
        offset += 32;
        
        // Parse verifier (PublicKey - 32 bytes)
        const verifierBytes = data.slice(offset, offset + 32);
        const verifier = new PublicKey(verifierBytes).toString();
        offset += 32;
        
        // Parse description (String: 4 bytes length + content up to 200)
        const descLen = data.readUInt32LE(offset);
        offset += 4;
        
        let description = '';
        if (descLen > 0 && descLen <= 200) {
          const rawDesc = data.slice(offset, offset + descLen).toString('utf8');
          // Clean up: remove null bytes and non-printable characters
          description = rawDesc.replace(/\0/g, '').replace(/[^\x20-\x7E\s]/g, '').trim();
        }
        
        // If description is empty or looks invalid, use placeholder
        if (!description || description.length < 3) {
          description = 'Data collection bounty';
        }
        
        offset += 200; // Skip fixed 200-byte allocation
        
        // Parse reward (u64 - 8 bytes)
        const reward = data.readBigUInt64LE(offset);
        offset += 8;
        
        // Parse state (enum as u8: 0=Open, 1=Submitted, 2=Completed, + 1 byte padding)
        const stateNum = data.readUInt8(offset);
        offset += 2; // 1 byte state + 1 byte padding
        
        let state = 'Open';
        if (stateNum === 1) state = 'Submitted';
        if (stateNum === 2) state = 'Completed';
        
        // Parse solver (PublicKey - 32 bytes)
        const solverBytes = data.slice(offset, offset + 32);
        const solverKey = new PublicKey(solverBytes);
        const solver = solverKey.toString();
        offset += 32;
        
        // Check if solver is default (all zeros)
        const isDefaultSolver = solverBytes.every(b => b === 0);
        
        // Parse data_url (String: 4 bytes length + content up to 200)
        const urlLen = data.readUInt32LE(offset);
        offset += 4;
        
        let dataUrl = '';
        if (urlLen > 0 && urlLen <= 200) {
          const rawUrl = data.slice(offset, offset + urlLen).toString('utf8');
          dataUrl = rawUrl.replace(/\0/g, '').trim();
        }
        
        console.log(`Successfully parsed bounty: ${description.slice(0, 30)}... (${reward.toString()} lamports)`);
        
        return {
          publicKey: account.pubkey.toString(),
          requester,
          verifier,
          description,
          rewardLamports: reward.toString(),
          state,
          solver: isDefaultSolver ? '' : solver,
          dataUrl,
        };
      } catch (err) {
        console.error('Error parsing account:', err);
        return null;
      }
    }).filter(b => b !== null);

    console.log(`Returning ${bounties.length} valid bounties`);
    return NextResponse.json({ bounties }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bounties', 
        details: error instanceof Error ? error.message : String(error),
        bounties: [] // Return empty array instead of error
      },
      { status: 200 } // Return 200 so frontend doesn't error out
    );
  }
}
