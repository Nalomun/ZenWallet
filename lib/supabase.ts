import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  selected_profile: string;
  created_at: string;
};

export type DemoProfile = {
  id: string;
  name: string;
  description: string;
  data: any; // Your existing MOCK_USER structure
};