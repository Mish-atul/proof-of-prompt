import { useState } from 'react';
import { Loader2, Upload, Sparkles, Copy, ExternalLink, CheckCircle, Download } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { generateContent } from '../lib/llm';
import { computeContentFingerprint } from '../lib/fingerprint';
import { uploadToIPFS } from '../lib/ipfs';
import { web3Service } from '../lib/web3';
import { supabase, ProofMetadata } from '../lib/supabase';

export function Register() {
  const { isConnected, connect, address } = useWallet();
  const [mode, setMode] = useState<'paste' | 'generate'>('generate');
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState('');
  const [modelVersion, setModelVersion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fingerprint, setFingerprint] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [metadataCID, setMetadataCID] = useState('');
  const [notes, setNotes] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateContent(prompt);
      setContent(result.content);
      setModel(result.model);
      setModelVersion(result.modelVersion);

      const fp = await computeContentFingerprint(result.content);
      setFingerprint(fp);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const fp = await computeContentFingerprint('', selectedFile);
      setFingerprint(fp);
    } else {
      const text = await selectedFile.text();
      setContent(text);
      const fp = await computeContentFingerprint(text);
      setFingerprint(fp);
    }
  };

  const handleComputeFingerprint = async () => {
    if (!content.trim() && !file) return;

    const fp = await computeContentFingerprint(content, file || undefined);
    setFingerprint(fp);
  };

  const handleRegister = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!fingerprint || !prompt.trim()) {
      alert('Please generate or paste content and enter the prompt');
      return;
    }

    setIsRegistering(true);
    try {
      const metadata: ProofMetadata = {
        fingerprint,
        prompt,
        content: content || undefined,
        model: model || 'user-provided',
        model_version: modelVersion || 'unknown',
        author_address: address!,
        timestamp: new Date().toISOString(),
        content_type: file?.type || 'text/plain',
        notes: notes || undefined,
      };

      const cid = await uploadToIPFS(metadata);
      setMetadataCID(cid);

      const hash = await web3Service.registerProof(fingerprint, cid);
      setTxHash(hash);

      await supabase.from('proofs').insert({
        fingerprint,
        owner_address: address!,
        prompt,
        model: metadata.model,
        model_version: metadata.model_version,
        content_type: metadata.content_type,
        metadata_cid: cid,
        tx_hash: hash,
        timestamp: metadata.timestamp,
        notes: notes || null,
      });

      alert('Proof registered successfully!');
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.message?.includes('Already registered')) {
        alert('This content has already been registered on-chain.');
      } else {
        alert('Failed to register proof: ' + error.message);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Register Proof</h1>
          <p className="text-gray-600">
            Generate or upload content, then register it on-chain with a verifiable fingerprint
          </p>
        </div>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Please connect your wallet to register proofs on-chain.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setMode('generate')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'generate'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="inline h-5 w-5 mr-2" />
              Generate with AI
            </button>
            <button
              onClick={() => setMode('paste')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'paste'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="inline h-5 w-5 mr-2" />
              Paste or Upload
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Used
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the prompt that was used to generate this content..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                rows={3}
              />
            </div>

            {mode === 'generate' ? (
              <div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content or Upload File
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your content here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    rows={6}
                  />
                  <div className="mt-3">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="text/*,image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                </div>
                {content || file ? (
                  <button
                    onClick={handleComputeFingerprint}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Compute Fingerprint
                  </button>
                ) : null}
              </>
            )}

            {content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generated Content Preview
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(content)}
                    className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Content
                  </button>
                  <button
                    onClick={downloadContent}
                    className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download as TXT
                  </button>
                </div>
              </div>
            )}

            {fingerprint && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 mb-1">Content Fingerprint</p>
                    <p className="text-xs text-green-700 font-mono break-all">{fingerprint}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(fingerprint)}
                    className="ml-3 p-2 text-green-700 hover:bg-green-100 rounded-lg"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {fingerprint && (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Registering On-Chain...
                  </>
                ) : (
                  'Register Proof (On-chain)'
                )}
              </button>
            )}
          </div>
        </div>

        {txHash && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Proof Registered Successfully!</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-mono text-gray-800 truncate">{txHash}</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-gray-700 hover:text-gray-900"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              {metadataCID && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Metadata CID:</p>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-mono text-gray-800 truncate">{metadataCID}</p>
                    <button
                      onClick={() => copyToClipboard(metadataCID)}
                      className="ml-3 text-gray-700 hover:text-gray-900"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
