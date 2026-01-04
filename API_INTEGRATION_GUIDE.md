# DeNova Bounty System - API Integration Guide

## Overview
The bounty system now has API routes that connect your Next.js frontend to the Solana smart contract.

## API Routes Created

### 1. **GET /api/bounties**
Fetches all bounties from the Solana blockchain.
- **Response**: Array of bounties with all metadata
- **Used by**: Dashboard to display all available bounties

### 2. **POST /api/bounties/create**
Initiates bounty creation. The client signs and submits the transaction.
- **Body**: `{ wallet, description, rewardSol, verifier, transaction }`
- **Returns**: Confirmation message and program ID

### 3. **POST /api/bounties/solve**
Submits work/solution for a bounty.
- **Body**: `{ bountyKey, wallet, dataUrl, transaction }`
- **Returns**: Confirmation message

### 4. **POST /api/bounties/review**
Approves or rejects a submitted solution.
- **Body**: `{ bountyKey, authority, approved, transaction }`
- **Returns**: Confirmation with action (approve/reject)

### 5. **POST /api/bounties/cancel**
Cancels an open bounty and refunds the creator.
- **Body**: `{ bountyKey, wallet, transaction }`
- **Returns**: Confirmation message

## How the Integration Works

### Frontend Flow:
1. **Dashboard loads** → Calls `fetchBounties()` → Calls `/api/bounties` → Displays bounties
2. **User creates bounty** → Calls `createBounty()` → Builds transaction on client → Signs with wallet → Submits to network
3. **User submits solution** → Calls `solveBounty()` → Builds transaction → Signs → Submits
4. **Validator reviews** → Calls `approveSolution()` or `rejectSolution()` → Signs transaction → Submits

### Transaction Signing:
- All transactions are **signed on the client side** using the user's wallet
- The API routes validate and log the requests
- This ensures security: the API never holds private keys

## Updated Functions in Program.ts

```typescript
// Fetch all bounties
fetchBounties(connection, wallet): Promise<OnChainBounty[]>

// Create a new bounty
createBounty(connection, wallet, description, rewardSol, verifier)

// Submit work
solveBounty(bountyKey, wallet, dataUrl)

// Approve submitted work
approveSolution(bountyKey, authority)

// Reject submitted work
rejectSolution(bountyKey, authority)

// Cancel a bounty
cancelBounty(connection, wallet, bountyKey)
```

## What Still Needs Implementation

### 1. Transaction Building
Each function needs to build the actual Anchor transaction. Currently, they send empty `transaction: ""` payloads.

**Example** (to be implemented in Program.ts):
```typescript
import * as anchor from '@coral-xyz/anchor';
import { BOUNTY_IDL } from './idl';

const program = new anchor.Program(BOUNTY_IDL, PROGRAM_ID, provider);

// In createBounty:
const tx = await program.methods
  .createBounty(description, rewardLamports, verifier)
  .accounts({
    bounty: bountyAccount.publicKey,
    requester: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([bountyAccount])
  .rpc();
```

### 2. Account Derivation
For each bounty operation, you need to:
- Derive the correct PDA (Program Derived Address) for the bounty account
- Pass correct authority accounts

### 3. Error Handling
Implement proper error handling:
- Check transaction confirmation status
- Handle insufficient funds
- Handle authorization errors
- Retry logic for failed transactions

### 4. Account Parsing
The bounty fetching API needs proper account data parsing based on your Anchor serialization format.

## Testing the API

```bash
# 1. Start your dev server
npm run dev

# 2. Test fetching bounties
curl http://localhost:3000/api/bounties

# 3. Test creating bounty (with proper transaction)
curl -X POST http://localhost:3000/api/bounties/create \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "YOUR_WALLET_ADDRESS",
    "description": "Test bounty",
    "rewardSol": 1.5,
    "verifier": "VERIFIER_ADDRESS",
    "transaction": ""
  }'
```

## Program ID
```
2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF
```

## Network
```
https://api.devnet.solana.com (Devnet)
```

## Next Steps

1. **Implement transaction building** in each function
2. **Test with actual wallet** (Phantom, Solflare, etc.)
3. **Deploy to production** and update API network to mainnet/testnet as needed
4. **Add real-time updates** using websockets instead of polling
5. **Implement proper error handling and retries**

## File Structure
```
frontend/
├── app/
│   ├── api/
│   │   └── bounties/
│   │       ├── route.ts          (GET /api/bounties)
│   │       ├── create/route.ts   (POST /api/bounties/create)
│   │       ├── solve/route.ts    (POST /api/bounties/solve)
│   │       ├── review/route.ts   (POST /api/bounties/review)
│   │       └── cancel/route.ts   (POST /api/bounties/cancel)
│   └── dashboard/
│       └── page.tsx              (Updated with new API calls)
└── utils/
    ├── Program.ts                (Updated to use APIs)
    └── idl.ts                    (New IDL file)
```
