# Proof-of-Prompt

A blockchain-based system to verify authorship and originality of AI-generated content using on-chain registries.

## Overview

Proof-of-Prompt allows creators and automated systems to register AI-generated content with a verifiable on-chain fingerprint and metadata. Third parties can later check authenticity and view human-friendly proof artifacts through a verification UI.

## Features

- **Wallet Authentication**: Connect with MetaMask or other EVM wallets
- **Content Generation**: Generate AI content from prompts or upload existing content
- **Content Fingerprinting**: SHA-256 hash of canonicalized content for unique identification
- **On-Chain Registry**: Immutable blockchain storage of proof fingerprints
- **IPFS Metadata Storage**: Decentralized storage of full metadata and prompts
- **Verification System**: Instant verification of registered content
- **Proof Certificates**: Exportable JSON certificates with transaction details
- **User Dashboard**: View all proofs registered from your wallet

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Blockchain**: Ethereum (Sepolia testnet) + Hardhat + Ethers.js v6
- **Storage**: IPFS via Web3.Storage + Supabase (off-chain index)
- **Smart Contract**: Solidity 0.8.20

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

WEB3_STORAGE_TOKEN=your_web3_storage_token

RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_for_testnet_only
```

### Smart Contract Deployment

1. Run tests:
```bash
npx hardhat test
```

2. Deploy to Sepolia:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

3. Update `VITE_CONTRACT_ADDRESS` in `.env` with the deployed address

### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Usage

### Registering Content

1. Connect your wallet
2. Navigate to "Register"
3. Enter a prompt and generate content (or paste/upload your own)
4. Review the computed fingerprint
5. Click "Register Proof" and confirm the transaction
6. Save the transaction hash and metadata CID

### Verifying Content

1. Navigate to "Verify"
2. Paste the content or upload a file
3. Click "Compute & Verify"
4. View proof details if registered (owner, timestamp, metadata)
5. Export a certificate for sharing

### Viewing Your Proofs

1. Connect your wallet
2. Navigate to "My Proofs"
3. Browse all proofs registered from your address
4. Click links to view transactions on Etherscan

## Architecture

```
Frontend (React)
    ↓
Web3 Provider (Ethers.js) ←→ Smart Contract (Sepolia)
    ↓                              ↓
Supabase (Index)              IPFS (Metadata)
```

## Smart Contract

The `ProofOfPromptRegistry` contract provides:

- `registerProof(bytes32 fingerprint, string metadataCID)`: Register a new proof
- `getProof(bytes32 fingerprint)`: Retrieve proof details
- `ProofRegistered` event: Emitted on successful registration

Contract prevents duplicate registrations and stores:
- Owner address
- Registration timestamp
- Metadata CID

## Data Model

### Metadata JSON (IPFS)

```json
{
  "fingerprint": "0xabc123...",
  "prompt": "Write a short poem about the sea",
  "model": "mock-llm-v1",
  "model_version": "2025-10-26",
  "author_address": "0x123...",
  "timestamp": "2025-11-01T15:30:00Z",
  "content_type": "text/plain",
  "notes": "Generated via demo"
}
```

### Database Schema (Supabase)

Table: `proofs`
- Stores off-chain index for fast queries
- Public read access for verification
- Indexed by fingerprint, owner_address, timestamp

## Security Considerations

- Private keys never stored or transmitted
- All transactions signed in user's wallet
- Row Level Security (RLS) enabled on database
- HTTPS for all API endpoints
- Content fingerprints are deterministic and collision-resistant

## Testing

Run the test suite:

```bash
npx hardhat test
```

Tests cover:
- Proof registration
- Duplicate rejection
- Multi-user scenarios
- Proof retrieval

## Demo Script

See [DEPLOY_AND_DEMO.md](./DEPLOY_AND_DEMO.md) for a complete 90-120 second demo walkthrough.

## Project Structure

```
.
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
├── test/                   # Smart contract tests
├── src/
│   ├── components/         # React components
│   ├── contexts/           # React contexts (wallet)
│   ├── lib/                # Utilities (web3, ipfs, fingerprint)
│   ├── pages/              # Main pages (Home, Register, Verify, MyProofs)
│   └── App.tsx             # Main app component
├── hardhat.config.ts       # Hardhat configuration
└── DEPLOY_AND_DEMO.md      # Deployment guide
```

## Legal Disclaimer

This system anchors content fingerprints on-chain. It is not a legal copyright registration service. Consult IP counsel for legal protection.

## License

MIT
