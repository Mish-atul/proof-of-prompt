import { useState } from 'react';
import { Search, CheckCircle, XCircle, ExternalLink, Download } from 'lucide-react';
import { computeContentFingerprint } from '../lib/fingerprint';
import { web3Service } from '../lib/web3';
import { supabase } from '../lib/supabase';
import { fetchFromIPFS } from '../lib/ipfs';

interface VerificationResult {
  found: boolean;
  owner?: string;
  timestamp?: number;
  metadataCID?: string;
  metadata?: any;
  prompt?: string;
  model?: string;
  notes?: string;
}

export function Verify() {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [fingerprint, setFingerprint] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    // If it's a text file, read its content
    if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
      try {
        const text = await selectedFile.text();
        setContent(text);
      } catch (error) {
        console.error('Failed to read file:', error);
        alert('Failed to read file content');
      }
    }
  };

  const handleVerify = async () => {
    if (!content.trim() && !file) {
      alert('Please provide content to verify');
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const fp = await computeContentFingerprint(content, file || undefined);
      setFingerprint(fp);

      const { data: dbProof } = await supabase
        .from('proofs')
        .select('*')
        .eq('fingerprint', fp)
        .maybeSingle();

      if (dbProof) {
        let metadata = null;
        try {
          metadata = await fetchFromIPFS(dbProof.metadata_cid);
        } catch (err) {
          console.error('Failed to fetch metadata from IPFS:', err);
        }

        setResult({
          found: true,
          owner: dbProof.owner_address,
          timestamp: new Date(dbProof.timestamp).getTime() / 1000,
          metadataCID: dbProof.metadata_cid,
          metadata,
          prompt: dbProof.prompt,
          model: dbProof.model,
          notes: dbProof.notes,
        });
      } else {
        try {
          const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
          if (contractAddress) {
            const proof = await web3Service.getProof(fp);
            if (proof.timestamp > 0n) {
              let metadata = null;
              try {
                metadata = await fetchFromIPFS(proof.metadataCID);
              } catch (err) {
                console.error('Failed to fetch metadata from IPFS:', err);
              }

              setResult({
                found: true,
                owner: proof.owner,
                timestamp: Number(proof.timestamp),
                metadataCID: proof.metadataCID,
                metadata,
              });
            } else {
              setResult({ found: false });
            }
          } else {
            setResult({ found: false });
          }
        } catch (err) {
          console.error('Blockchain query failed:', err);
          setResult({ found: false });
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Failed to verify content');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const exportCertificate = () => {
    if (!result) return;

    const certificate = {
      verified: result.found,
      fingerprint,
      owner: result.owner,
      timestamp: result.timestamp ? formatDate(result.timestamp) : '',
      metadataCID: result.metadataCID,
      prompt: result.prompt,
      model: result.model,
      notes: result.notes,
      verifiedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(certificate, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proof-certificate-${fingerprint.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Verify Proof</h1>
          <p className="text-gray-600">
            Check if content has been registered on-chain by computing its fingerprint
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content to Verify
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the content you want to verify..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                rows={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload TXT File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,text/plain"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ File loaded: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={isVerifying || (!content.trim() && !file)}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <Search className="animate-pulse h-5 w-5 mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Compute & Verify
                </>
              )}
            </button>
          </div>
        </div>

        {fingerprint && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-1">Computed Fingerprint:</p>
            <p className="text-xs text-gray-900 font-mono break-all">{fingerprint}</p>
          </div>
        )}

        {result && (
          <div
            className={`rounded-xl shadow-sm border p-6 ${
              result.found
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start mb-4">
              {result.found ? (
                <CheckCircle className="h-8 w-8 text-green-600 mr-3 flex-shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 mr-3 flex-shrink-0" />
              )}
              <div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    result.found ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.found ? 'Proof Found!' : 'No Proof Found'}
                </h3>
                <p
                  className={`text-sm ${
                    result.found ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.found
                    ? 'This content has been registered on-chain with verifiable proof of ownership.'
                    : 'This content has not been registered. You can register it now.'}
                </p>
              </div>
            </div>

            {result.found && (
              <div className="mt-4 space-y-3 bg-white rounded-lg p-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Owner Address</p>
                  <p className="text-sm font-mono text-gray-900">{result.owner}</p>
                </div>
                {result.timestamp && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Registered At</p>
                    <p className="text-sm text-gray-900">{formatDate(result.timestamp)}</p>
                  </div>
                )}
                {result.prompt && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Original Prompt</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{result.prompt}</p>
                  </div>
                )}
                {result.metadata?.content && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Registered Content</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">{result.metadata.content}</p>
                  </div>
                )}
                {result.model && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Model Used</p>
                    <p className="text-sm text-gray-900">{result.model}</p>
                  </div>
                )}
                {result.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-gray-900">{result.notes}</p>
                  </div>
                )}
                {result.metadataCID && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Metadata CID</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono text-gray-900">{result.metadataCID}</p>
                      <a
                        href={`https://w3s.link/ipfs/${result.metadataCID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 text-gray-700 hover:text-gray-900"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}

                <button
                  onClick={exportCertificate}
                  className="w-full mt-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Certificate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
