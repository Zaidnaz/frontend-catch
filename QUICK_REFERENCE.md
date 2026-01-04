# 🚀 DeNova API Quick Reference

## Contract Details
- **Program ID**: `2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF`
- **Network**: Solana Devnet (`https://api.devnet.solana.com`)
- **Deployed**: ✅ https://explorer.solana.com/tx/2uxHAdaNmGMuJEG86Sh3W6zDnHnfnXsY9yLKj9yBw9QDwK3vUs3HzUzpWeKgTG1AD53h9nPPc5HJLhYDKtidFCxy?cluster=devnet

## API Routes

### Get All Bounties
```
GET /api/bounties
```
Returns all bounties from the blockchain

**Response Example**:
```json
{
  "bounties": [
    {
      "publicKey": "8x2...9aB",
      "requester": "5cn...",
      "verifier": "Gov...",
      "description": "Collect 5000 images",
      "rewardLamports": "1500000000",
      "state": "Open",
      "solver": "",
      "dataUrl": ""
    }
  ]
}
```

### Create Bounty
```
POST /api/bounties/create
```
**Request**:
```json
{
  "wallet": "5cn...",
  "description": "Your bounty description",
  "rewardSol": 1.5,
  "verifier": "Ver..."
}
```

### Submit Solution
```
POST /api/bounties/solve
```
**Request**:
```json
{
  "bountyKey": "8x2...",
  "wallet": "5cn...",
  "dataUrl": "https://..."
}
```

### Review Solution (Approve/Reject)
```
POST /api/bounties/review
```
**Request**:
```json
{
  "bountyKey": "8x2...",
  "authority": "5cn...",
  "approved": true
}
```

### Cancel Bounty
```
POST /api/bounties/cancel
```
**Request**:
```json
{
  "bountyKey": "8x2...",
  "wallet": "5cn..."
}
```

## Dashboard Usage

### 1. **Data Hunters Tab** 🎯
- Shows all OPEN bounties
- Click "Submit Solution" to complete work
- Provide data URL (IPFS, Arweave, etc.)

### 2. **My Signals Tab** 📡
- Shows bounties YOU created
- Click trash icon to cancel and refund
- View pending validation

### 3. **Validation Tab** ⚖️
- Shows submissions waiting for review
- Approve to pay solver
- Reject to reopen bounty

### 4. **Wallet Stats** 💰
- Total spent on bounties
- Total earned from solving
- Completed tasks count

## Code Examples

### Import Functions
```typescript
import {
  fetchBounties,
  createBounty,
  solveBounty,
  approveSolution,
  rejectSolution,
  cancelBounty
} from '@/utils/Program';
```

### Create a Bounty
```typescript
const result = await createBounty(
  connection,
  wallet,
  "Collect 1000 images",
  2.5, // SOL
  verifierPublicKey
);

console.log("Created:", result.publicKey);
console.log("Signature:", result.signature);
```

### Submit a Solution
```typescript
const signature = await solveBounty(
  "bountyPublicKey",
  wallet,
  "https://ipfs.io/ipfs/Qm...",
  connection
);
```

### Approve a Solution
```typescript
const signature = await approveSolution(
  bountyKey,
  authority, // wallet that created or verified
  requesterAddress,
  solverAddress,
  connection
);
```

### Reject a Solution
```typescript
const signature = await rejectSolution(
  bountyKey,
  authority,
  requesterAddress,
  solverAddress,
  connection
);
```

### Cancel a Bounty
```typescript
const signature = await cancelBounty(
  connection,
  wallet,
  bountyKey
);
```

### Fetch All Bounties
```typescript
const bounties = await fetchBounties(connection, wallet);
bounties.forEach(b => {
  console.log(`${b.description} - ${b.rewardLamports / 1e9} SOL`);
});
```

## Transaction States

### Bounty States
- **Open** ✅ - Ready for submissions
- **Submitted** ⏳ - Waiting for review
- **Completed** ✔️ - Funded solver, account closed

## Error Codes
```
6000: NotOpen          - Bounty not open for submission
6001: NoSubmission     - No submission to review
6002: PendingReview    - Can't cancel, submission pending
6003: NotAuthorized    - Unauthorized action
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Wallet not connected" | Click Select Wallet button and approve |
| "Insufficient funds" | Get devnet SOL from faucet |
| "Transaction failed" | Check bounty state and permissions |
| "API error 500" | RPC down - check Solana status |

## Getting Devnet SOL
```bash
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

Or visit: https://faucet.solana.com/

## Testing Checklist
- [ ] Fetch bounties loads correctly
- [ ] Can see mock data or chain data
- [ ] Can create a bounty (needs wallet)
- [ ] Can submit solution
- [ ] Can approve/reject submissions
- [ ] Can cancel bounty
- [ ] Wallet balance updates
- [ ] Transactions visible on explorer

## Debug Mode
Open browser console (F12) to see:
- API call logs
- Transaction building details
- Signature confirmations
- Error messages

Look for:
- 📤 = Outgoing action
- ✅ = Success
- ❌ = Error
