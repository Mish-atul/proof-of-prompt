import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Calendar, Copy } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { supabase, ProofRecord } from '../lib/supabase';

export function MyProofs() {
  const { address, isConnected } = useWallet();
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadProofs();
    } else {
      setProofs([]);
      setIsLoading(false);
    }
  }, [address, isConnected]);

  const loadProofs = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('owner_address', address)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setProofs(data || []);
    } catch (error) {
      console.error('Failed to load proofs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">My Proofs</h1>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to view your registered proofs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">My Proofs</h1>
          <p className="text-gray-600">
            View all proofs registered from your wallet address
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading your proofs...</p>
          </div>
        ) : proofs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Proofs Yet</h3>
            <p className="text-gray-600">
              You haven't registered any proofs yet. Get started by registering your first content!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proofs.map((proof) => (
              <div
                key={proof.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {proof.content_type}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {proof.prompt}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {proof.tx_hash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${proof.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View on Block Explorer"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Fingerprint</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-mono text-gray-900 truncate flex-1">
                        {proof.fingerprint}
                      </p>
                      <button
                        onClick={() => copyToClipboard(proof.fingerprint)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Model</p>
                    <p className="text-xs text-gray-900">
                      {proof.model} {proof.model_version && `(${proof.model_version})`}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Registered</p>
                    <div className="flex items-center text-xs text-gray-900">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(proof.timestamp)}
                    </div>
                  </div>
                  {proof.metadata_cid && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Metadata CID</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-mono text-gray-900 truncate flex-1">
                          {proof.metadata_cid}
                        </p>
                        <a
                          href={`https://w3s.link/ipfs/${proof.metadata_cid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {proof.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
                    <p className="text-xs text-gray-900">{proof.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
