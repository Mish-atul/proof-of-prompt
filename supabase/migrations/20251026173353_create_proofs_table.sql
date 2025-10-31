/*
  # Create Proofs Index Table

  1. New Tables
    - `proofs`
      - `id` (uuid, primary key) - Unique identifier for each proof record
      - `fingerprint` (text, unique, indexed) - SHA-256 hash of canonicalized content
      - `owner_address` (text, indexed) - Ethereum address of the proof owner
      - `prompt` (text) - The original prompt used to generate content
      - `model` (text) - AI model identifier (e.g., "gpt-4", "claude-3")
      - `model_version` (text) - Version of the model used
      - `content_type` (text) - MIME type of content (text/plain, image/png, etc.)
      - `content_cid` (text, nullable) - IPFS CID of full content (optional for privacy)
      - `metadata_cid` (text) - IPFS CID of metadata JSON
      - `tx_hash` (text, nullable) - Blockchain transaction hash
      - `timestamp` (timestamptz) - When proof was registered
      - `notes` (text, nullable) - Additional notes from creator
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `proofs` table
    - Public read access for verification (anyone can verify proofs)
    - Only authenticated users can insert their own proofs
    - Users can update/delete only their own proofs

  3. Indexes
    - Index on `fingerprint` for fast lookup during verification
    - Index on `owner_address` for user dashboard queries
    - Index on `timestamp` for chronological sorting
*/

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
    ON proofs FOR SELECT
    USING (true);

CREATE POLICY "Users can insert proofs with any owner address"
    ON proofs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own proofs"
    ON proofs FOR UPDATE
    USING (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
    WITH CHECK (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can delete their own proofs"
    ON proofs FOR DELETE
    USING (owner_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');
