import { Shield, CheckCircle, Lock, Search } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-2xl mb-6">
            <Shield className="h-12 w-12 text-gray-900" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Proof-of-Prompt
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Verify authorship and originality of AI-generated content using secure on-chain registries.
            Register your AI outputs with verifiable fingerprints and immutable timestamps.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all transform hover:scale-105"
            >
              Register Content
            </button>
            <button
              onClick={() => onNavigate('verify')}
              className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-lg font-medium hover:border-gray-900 transition-all"
            >
              Verify Proof
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-xl mb-4">
              <Lock className="h-6 w-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              On-Chain Registry
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Content fingerprints are stored on the blockchain with cryptographic proof of ownership and timestamp.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-xl mb-4">
              <CheckCircle className="h-6 w-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Verifiable Metadata
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Store prompts, model information, and generation details immutably on IPFS with blockchain anchoring.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-xl mb-4">
              <Search className="h-6 w-6 text-gray-900" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Instant Verification
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Verify content authenticity in seconds by comparing fingerprints against the on-chain registry.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-gray-500 mb-3">01</div>
              <h4 className="text-lg font-semibold mb-2">Connect Wallet</h4>
              <p className="text-gray-400 text-sm">
                Connect your MetaMask wallet to authenticate and sign transactions.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-500 mb-3">02</div>
              <h4 className="text-lg font-semibold mb-2">Generate or Upload</h4>
              <p className="text-gray-400 text-sm">
                Generate AI content or upload existing content with the original prompt.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-500 mb-3">03</div>
              <h4 className="text-lg font-semibold mb-2">Register On-Chain</h4>
              <p className="text-gray-400 text-sm">
                Create a unique fingerprint and register it on the blockchain with metadata.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-500 mb-3">04</div>
              <h4 className="text-lg font-semibold mb-2">Verify & Share</h4>
              <p className="text-gray-400 text-sm">
                Verify content authenticity anytime and export proof certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            This system anchors content fingerprints on-chain. It is not a legal copyright registration service.
            Consult IP counsel for legal protection.
          </p>
        </div>
      </div>
    </div>
  );
}
