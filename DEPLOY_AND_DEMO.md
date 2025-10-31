# Proof-of-Prompt - Deployment and Demo Guide

This guide provides step-by-step instructions to deploy the smart contract to a testnet and run the demo.

## Prerequisites

1. MetaMask wallet installed in your browser
2. Sepolia testnet ETH (get free from [Sepolia Faucet](https://sepoliafaucet.com/))
3. Infura or Alchemy account for RPC access (or use a public RPC)
4. (Optional) Web3.Storage account for IPFS uploads

## Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in your `.env` file with the following:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_CONTRACT_ADDRESS=
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

WEB3_STORAGE_TOKEN=your_web3_storage_token

RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_for_testnet_only
```

**Important Security Notes:**
- NEVER commit private keys to version control
- NEVER use a mainnet wallet's private key
- Create a dedicated testnet wallet for deployment
- The DEPLOYER_PRIVATE_KEY is only for contract deployment via Hardhat

## Smart Contract Deployment

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Tests
```bash
npx hardhat test
```

Expected output: All tests should pass, confirming the contract works correctly.

### Step 3: Deploy to Sepolia Testnet
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

This will output something like:
```
Deploying ProofOfPromptRegistry...
ProofOfPromptRegistry deployed to: 0x1234567890abcdef...
Save this address to your .env file as VITE_CONTRACT_ADDRESS
```

### Step 4: Update Environment Variables
Copy the deployed contract address and add it to your `.env` file:
```
VITE_CONTRACT_ADDRESS=0x1234567890abcdef...
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Demo Script (90-120 seconds)

Follow these steps to demonstrate the full functionality:

### 1. Connect Wallet (10 seconds)
- Click "Connect Wallet" in the top right
- Approve the MetaMask connection
- Verify your address appears in the navbar

### 2. Register Content (40 seconds)
- Navigate to "Register" page
- Enter a prompt: "Write a short poem about the sea"
- Click "Generate Content" (or paste your own content)
- Review the generated content and computed fingerprint
- Click "Register Proof (On-chain)"
- Confirm the transaction in MetaMask
- Wait for transaction confirmation
- Note the transaction hash and metadata CID displayed

### 3. Verify Content (30 seconds)
- Navigate to "Verify" page
- Paste the same content you just registered
- Click "Compute & Verify"
- Observe the green success message showing:
  - Owner address (your wallet)
  - Registration timestamp
  - Original prompt
  - Model information
  - Metadata CID
- Click "Export Certificate" to download the proof certificate JSON

### 4. View Dashboard (20 seconds)
- Navigate to "My Proofs"
- See your registered proof listed
- Click the external link icon to view the transaction on Etherscan
- Review all metadata stored for the proof

### 5. Test Unregistered Content (10 seconds)
- Go back to "Verify"
- Paste different content that hasn't been registered
- Click "Compute & Verify"
- Observe the red message: "No Proof Found"

## Key Features Demonstrated

1. **Wallet Integration**: MetaMask connection for signing transactions
2. **Content Generation**: Mock LLM generates content from prompts
3. **Fingerprinting**: SHA-256 hash of canonicalized content
4. **On-Chain Registration**: Smart contract stores proof with metadata CID
5. **IPFS Storage**: Metadata stored immutably (mock mode if no token configured)
6. **Verification**: Anyone can verify content against on-chain registry
7. **Certificate Export**: Downloadable JSON certificate for sharing
8. **Dashboard**: View all proofs registered by your wallet

## Testing the Smart Contract

Run the Hardhat test suite:
```bash
npx hardhat test
```

Tests include:
- Registration of new proofs
- Rejection of duplicate registrations
- Multiple users registering different content
- Retrieval of registered proofs
- Handling of unregistered fingerprints

## Mock vs. Production Mode

### Mock Mode (Default)
- Works without IPFS configuration
- Generates random CIDs for metadata storage
- Allows testing full flow without external dependencies
- Perfect for demos and development

### Production Mode
- Set `WEB3_STORAGE_TOKEN` in `.env`
- Metadata uploaded to actual IPFS
- Publicly verifiable and persistent
- Required for production deployment

## Architecture Overview

```
┌─────────────────┐
│   React App     │  (Frontend: Register, Verify, Dashboard)
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼────┐ ┌──▼──────┐
│ Web3   │ │ Supabase│  (Off-chain index for fast queries)
│Provider│ │         │
└───┬────┘ └─────────┘
    │
┌───▼────────────────┐
│  Smart Contract    │  (On-chain registry)
│  (Sepolia Testnet) │
└────────────────────┘
    │
┌───▼───┐
│ IPFS  │  (Metadata storage)
└───────┘
```

## Troubleshooting

### MetaMask Not Connecting
- Ensure MetaMask is unlocked
- Check that you're on Sepolia testnet
- Clear browser cache and reload

### Transaction Failing
- Verify you have enough Sepolia ETH for gas
- Check contract address is correctly set in `.env`
- Ensure wallet is connected

### IPFS Upload Failing
- Mock mode will continue working
- Check Web3.Storage token is valid
- Network connectivity issues may cause failures

### Build Errors
- Run `npm install` again
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check that all environment variables are set

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure you're using the correct network (Sepolia)
4. Review the test suite to understand expected behavior

## Legal Disclaimer

This system anchors content fingerprints on-chain. It is not a legal copyright registration service. Consult IP counsel for legal protection.
