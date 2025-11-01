````markdown
# Proof-of-Prompt 🔐

A blockchain-based system to verify authorship and originality of AI-generated content using on-chain registries and cryptographic fingerprinting.

## 🌐 Live Demo

**Deployed Application**: [Add your Vercel URL here]

**Smart Contract (Sepolia)**: [`0x230a167213fa8f007beC59BeC43E31bEddf8fca0`](https://sepolia.etherscan.io/address/0x230a167213fa8f007beC59BeC43E31bEddf8fca0)

---

## 📖 Overview

Proof-of-Prompt empowers creators to register AI-generated content with verifiable on-chain fingerprints and metadata. Using Google's Gemini AI for content generation, blockchain for immutable records, and IPFS for decentralized storage, this platform provides a trustless verification system for digital content authenticity.

## ✨ Features

- **🤖 AI Content Generation**: Generate content using Google Gemini 2.0 Flash
- **📥 Download & Upload**: Download generated content as TXT files and upload for verification
- **🔐 Wallet Authentication**: Connect with MetaMask or other Web3 wallets
- **🔍 Content Fingerprinting**: Keccak-256 hash of canonicalized content for unique identification
- **⛓️ On-Chain Registry**: Immutable Ethereum (Sepolia) storage of proof fingerprints
- **📦 IPFS Metadata Storage**: Decentralized storage of full content, prompts, and metadata
- **✅ Instant Verification**: Verify any content against on-chain records
- **📜 Proof Certificates**: Exportable JSON certificates with transaction details
- **📊 User Dashboard**: View all proofs registered from your wallet address
- **🎨 Modern UI**: Clean, responsive interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Blockchain & Web3
- **Ethereum (Sepolia Testnet)** - Smart contract deployment
- **Hardhat** - Development environment
- **Ethers.js v6** - Blockchain interaction
- **Solidity 0.8.20** - Smart contract language

### Storage & AI
- **Supabase** - Off-chain indexing and database
- **IPFS (Web3.Storage)** - Decentralized metadata storage
- **Google Gemini 2.0 Flash** - AI content generation

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** installed
- **MetaMask** browser extension
- **Sepolia ETH** for gas fees ([Get from faucet](https://sepoliafaucet.com/))
- **Supabase Account** ([Sign up](https://supabase.com))
- **Google Gemini API Key** ([Get from AI Studio](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/Mish-atul/proof-of-prompt.git
cd proof-of-prompt

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Smart Contract & RPC
VITE_CONTRACT_ADDRESS=0x230a167213fa8f007beC59BeC43E31bEddf8fca0
VITE_RPC_URL=https://sepolia.infura.io/v3/your_infura_key

# For Local Contract Deployment (Optional)
RPC_URL=https://sepolia.infura.io/v3/your_infura_key
DEPLOYER_PRIVATE_KEY=your_private_key_DO_NOT_SHARE
```

### Supabase Setup

1. Create a new Supabase project
2. Go to **SQL Editor** and run:

```sql
CREATE TABLE IF NOT EXISTS proofs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint text UNIQUE NOT NULL,
    owner_address text NOT NULL,
    prompt text NOT NULL,
    model text NOT NULL,
    model_version text DEFAULT '',
    content_type text DEFAULT 'text/plain',
    content_cid text,
    metadata_cid text NOT NULL,
    tx_hash text,
    timestamp timestamptz NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proofs_fingerprint ON proofs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_proofs_owner_address ON proofs(owner_address);
CREATE INDEX IF NOT EXISTS idx_proofs_timestamp ON proofs(timestamp DESC);

ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proofs for verification"
    ON proofs FOR SELECT USING (true);

CREATE POLICY "Users can insert proofs with any owner address"
    ON proofs FOR INSERT WITH CHECK (true);
```

3. Copy your Project URL and anon key to `.env`

### Smart Contract Deployment (Optional)

The contract is already deployed on Sepolia. To deploy your own:

1. **Run tests:**
```bash
npx hardhat test
```

2. **Deploy to Sepolia:**
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

3. **Update `.env`** with your new contract address

### Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 📱 Usage Guide

### 1️⃣ Registering Content

1. **Connect Wallet** - Click "Connect Wallet" and approve MetaMask
2. **Navigate to Register** page
3. **Enter a Prompt** - Type your content generation prompt
4. **Generate Content** - Click "Generate Content" to use Gemini AI
5. **Review Content** - Check the generated content preview
6. **Download (Optional)** - Save the content as a TXT file
7. **Register Proof** - Click "Register Proof" and confirm transaction
8. **Save Details** - Note the transaction hash and metadata CID

### 2️⃣ Verifying Content

**Option A: Manual Entry**
1. Navigate to **Verify** page
2. Paste the content in the textarea
3. Click "Compute & Verify"

**Option B: File Upload**
1. Navigate to **Verify** page
2. Click "Choose File" and select the downloaded TXT file
3. Content is automatically loaded
4. Click "Compute & Verify"

**Verification Results:**
- ✅ **Proof Found**: Shows owner, timestamp, prompt, model, and metadata
- ❌ **No Proof Found**: Content hasn't been registered
- 📥 **Export Certificate**: Download verification proof as JSON

### 3️⃣ Viewing Your Proofs

1. Connect your wallet
2. Navigate to **My Proofs**
3. Browse all registered proofs from your address
4. Click transaction links to view on Etherscan
5. View prompt, model, and registration details

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│              Vite + TypeScript + Tailwind            │
└────────────┬──────────────────────────┬──────────────┘
             │                          │
             ▼                          ▼
    ┌────────────────┐        ┌─────────────────┐
    │  Google Gemini │        │  Web3 Provider  │
    │   (AI Model)   │        │   (Ethers.js)   │
    └────────────────┘        └────────┬────────┘
                                       │
                      ┌────────────────┼────────────────┐
                      ▼                ▼                ▼
              ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
              │   Supabase   │ │  Smart      │ │     IPFS     │
              │   (Index)    │ │  Contract   │ │  (Metadata)  │
              │   Database   │ │  (Sepolia)  │ │ Web3.Storage │
              └──────────────┘ └─────────────┘ └──────────────┘
```

## 📄 Smart Contract

**Contract Address**: `0x230a167213fa8f007beC59BeC43E31bEddf8fca0`  
**Network**: Sepolia Testnet  
**Compiler**: Solidity 0.8.20

### Key Functions

- `registerProof(bytes32 fingerprint, string metadataCID)` - Register a new proof
- `getProof(bytes32 fingerprint)` - Retrieve proof details
- `ProofRegistered` event - Emitted on successful registration

### Storage

- Owner address
- Registration timestamp (block.timestamp)
- Metadata CID (IPFS)
- Prevents duplicate fingerprints

## 💾 Data Models

### Metadata JSON (IPFS)

```json
{
  "fingerprint": "0xabc123...",
  "prompt": "Write a short poem about blockchain",
  "content": "The actual generated content text...",
  "model": "gemini-2.0-flash-exp",
  "model_version": "2.0",
  "author_address": "0x123...",
  "timestamp": "2025-11-01T15:30:00Z",
  "content_type": "text/plain",
  "notes": "Optional notes"
}
```

### Database Schema (Supabase)

**Table**: `proofs`

| Column          | Type         | Description                    |
|-----------------|--------------|--------------------------------|
| id              | uuid         | Primary key                    |
| fingerprint     | text         | Keccak-256 hash (unique)       |
| owner_address   | text         | Wallet address                 |
| prompt          | text         | Original prompt                |
| model           | text         | AI model identifier            |
| model_version   | text         | Model version                  |
| content_type    | text         | MIME type                      |
| content_cid     | text         | IPFS CID (optional)            |
| metadata_cid    | text         | IPFS metadata CID              |
| tx_hash         | text         | Transaction hash               |
| timestamp       | timestamptz  | Registration time              |
| notes           | text         | Additional notes               |
| created_at      | timestamptz  | Record creation                |
| updated_at      | timestamptz  | Last update                    |

## 🔒 Security Considerations

- ✅ Private keys never stored or transmitted
- ✅ All transactions signed in user's wallet
- ✅ Row Level Security (RLS) enabled on database
- ✅ HTTPS for all API endpoints
- ✅ Content fingerprints are deterministic
- ✅ Keccak-256 hashing (collision-resistant)
- ⚠️ API keys should be stored securely (use environment variables)
- ⚠️ Never commit `.env` file to version control

## 🧪 Testing

Run the smart contract test suite:

```bash
npx hardhat test
```

**Test Coverage:**
- ✅ Proof registration
- ✅ Duplicate rejection
- ✅ Multi-user scenarios
- ✅ Proof retrieval
- ✅ Event emission

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub** (already done)

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Add Environment Variables:**
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_GEMINI_API_KEY
   VITE_CONTRACT_ADDRESS
   VITE_RPC_URL
   ```

4. **Deploy** and get your live URL!

**⚠️ Important:** Never add `DEPLOYER_PRIVATE_KEY` to Vercel!

## 📂 Project Structure

```
proof-of-prompt/
├── contracts/              # Solidity smart contracts
│   └── ProofOfPromptRegistry.sol
├── scripts/                # Deployment scripts
│   └── deploy.cjs
├── test/                   # Smart contract tests
│   └── ProofOfPromptRegistry.test.cjs
├── src/
│   ├── components/         # React components
│   │   └── Navbar.tsx
│   ├── contexts/           # React contexts
│   │   └── WalletContext.tsx
│   ├── lib/                # Utility libraries
│   │   ├── fingerprint.ts  # Content hashing
│   │   ├── ipfs.ts         # IPFS integration
│   │   ├── llm.ts          # Gemini AI integration
│   │   ├── supabase.ts     # Database client
│   │   └── web3.ts         # Blockchain interaction
│   ├── pages/              # Main application pages
│   │   ├── Home.tsx        # Landing page
│   │   ├── Register.tsx    # Content registration
│   │   ├── Verify.tsx      # Content verification
│   │   └── MyProofs.tsx    # User dashboard
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── hardhat.config.cjs      # Hardhat configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json            # Dependencies

```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Support for image content fingerprinting
- [ ] Batch proof registration
- [ ] Enhanced search and filtering
- [ ] Mainnet deployment option
- [ ] Mobile app (React Native)
- [ ] Integration with more AI models (Claude, GPT-4)
- [ ] NFT minting for verified proofs
- [ ] Advanced analytics dashboard

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](#license-details) section below for details.

### License Details

```
MIT License

Copyright (c) 2025 Mish-atul

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## ⚖️ Legal Disclaimer

This system anchors content fingerprints on-chain for verification purposes. **It is not a legal copyright registration service.** The platform provides technical proof of content registration at a specific timestamp but does not constitute legal copyright protection or ownership rights.

For legal protection of intellectual property, consult with a qualified IP attorney in your jurisdiction.

## 👨‍💻 Author

**Mish-atul**
- GitHub: [@Mish-atul](https://github.com/Mish-atul)
- Project: [proof-of-prompt](https://github.com/Mish-atul/proof-of-prompt)

## 🙏 Acknowledgments

- [Ethereum Foundation](https://ethereum.org/) - Blockchain infrastructure
- [Google AI](https://ai.google.dev/) - Gemini AI model
- [Supabase](https://supabase.com/) - Database and backend services
- [IPFS](https://ipfs.tech/) - Decentralized storage
- [Hardhat](https://hardhat.org/) - Smart contract development
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](#-getting-started)
2. Search [existing issues](https://github.com/Mish-atul/proof-of-prompt/issues)
3. Open a [new issue](https://github.com/Mish-atul/proof-of-prompt/issues/new)

---

**⭐ Star this repository if you find it useful!**

Made with ❤️ by [Mish-atul](https://github.com/Mish-atul)

````

## Legal Disclaimer

This system anchors content fingerprints on-chain. It is not a legal copyright registration service. Consult IP counsel for legal protection.

## License

MIT
