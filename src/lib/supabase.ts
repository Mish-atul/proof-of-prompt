import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProofMetadata {
  fingerprint: string;
  prompt: string;
  content?: string;
  model: string;
  model_version?: string;
  author_address: string;
  timestamp: string;
  content_cid?: string;
  content_type: string;
  notes?: string;
}

export interface ProofRecord {
  id: string;
  fingerprint: string;
  owner_address: string;
  prompt: string;
  model: string;
  model_version: string;
  content_type: string;
  content_cid: string | null;
  metadata_cid: string;
  tx_hash: string | null;
  timestamp: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
