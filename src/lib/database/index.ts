import { DatabaseProvider } from './types';
import { SupabaseProvider } from './supabase';

export function createDatabaseProvider(): DatabaseProvider {
  const provider = process.env.DATABASE_PROVIDER || 'supabase';
  
  switch (provider) {
    case 'supabase':
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and anon key are required');
      }
      
      return new SupabaseProvider(supabaseUrl, supabaseAnonKey);
    
    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
}

export const db = createDatabaseProvider();
export * from './types';