import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "fingerprint", "type": "bytes32" },
      { "internalType": "string", "name": "metadataCID", "type": "string" }
    ],
    "name": "registerProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "fingerprint", "type": "bytes32" }
    ],
    "name": "getProof",
    "outputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "string", "name": "metadataCID", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "fingerprint", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "metadataCID", "type": "string" }
    ],
    "name": "ProofRegistered",
    "type": "event"
  }
];

const SEPOLIA_CHAIN_ID = '0xaa36a7';
const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private contract: Contract | null = null;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [import.meta.env.VITE_RPC_URL],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Sepolia network');
      }
    }

    this.provider = new BrowserProvider(window.ethereum);
    await this.provider.send('eth_requestAccounts', []);

    const network = await this.provider.getNetwork();
    if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DECIMAL) {
      throw new Error(`Wrong network! Please switch to Sepolia. Current: ${network.name} (${network.chainId})`);
    }

    console.log(`✅ Connected to Sepolia via Infura: ${network.name}`);

    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (contractAddress) {
      this.contract = new Contract(contractAddress, CONTRACT_ABI, this.signer);
      console.log(`✅ Contract loaded at: ${contractAddress.toLowerCase()}`);
    }

    return address;
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  isConnected(): boolean {
    return this.signer !== null;
  }

  getContract(): Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized. Connect wallet first.');
    }
    return this.contract;
  }

  async registerProof(fingerprint: string, metadataCID: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const network = await this.provider.getNetwork();
    if (Number(network.chainId) !== SEPOLIA_CHAIN_ID_DECIMAL) {
      throw new Error(`Wrong network! You are on ${network.name}. Please switch to Sepolia testnet.`);
    }

    const contract = this.getContract();
    const tx = await contract.registerProof(fingerprint, metadataCID);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getProof(fingerprint: string): Promise<{ owner: string; timestamp: bigint; metadataCID: string }> {
    const contract = this.getContract();
    const [owner, timestamp, metadataCID] = await contract.getProof(fingerprint);
    return { owner, timestamp, metadataCID };
  }

  async getCurrentAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }
}

export const web3Service = new Web3Service();

declare global {
  interface Window {
    ethereum?: any;
  }
}
