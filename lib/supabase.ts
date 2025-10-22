import { createClient } from '@supabase/supabase-js';
import { User, Post, PostLike } from '@/types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using mock data for development.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better type safety
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'hedera_account_id' | 'created_at'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'author' | 'view_count' | 'like_count' | 'dislike_count' | 'created_at' | 'updated_at' | 'user_like'>;
        Update: Partial<Omit<Post, 'id' | 'author_id' | 'author' | 'created_at' | 'user_like'>>;
      };
      post_likes: {
        Row: PostLike;
        Insert: Omit<PostLike, 'id' | 'created_at'>;
        Update: Partial<Omit<PostLike, 'id' | 'user_id' | 'post_id' | 'created_at'>>;
      };
    };
  };
}

// User management functions
export class UserService {
  static async findByHederaAccountId(hederaAccountId: string): Promise<User | null> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        // Return mock user for development
        return {
          id: `user-${hederaAccountId}`,
          hedera_account_id: hederaAccountId,
          display_name: `User ${hederaAccountId.slice(-4)}`,
          bio: '',
          avatar_url: '',
          agent_endpoint_url: '',
          content_price_in_platform_token: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('hedera_account_id', hederaAccountId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error finding user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findByHederaAccountId:', error);
      return null;
    }
  }

  static async createUser(userData: {
    hedera_account_id: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    agent_endpoint_url?: string;
    content_price_in_platform_token?: number;
  }): Promise<User | null> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        // Return mock user for development
        return {
          id: `user-${userData.hedera_account_id}`,
          hedera_account_id: userData.hedera_account_id,
          display_name: userData.display_name || `User ${userData.hedera_account_id.slice(-4)}`,
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || '',
          agent_endpoint_url: userData.agent_endpoint_url || '',
          content_price_in_platform_token: userData.content_price_in_platform_token || 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createUser:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updates: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    agent_endpoint_url?: string;
    content_price_in_platform_token?: number;
  }): Promise<User | null> {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase not configured, cannot update user');
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  }
}

// Creator status checking
export class CreatorService {
  static async checkCreatorStatus(hederaAccountId: string): Promise<boolean> {
    try {
      // Check if contract configuration is available
      const contractId = process.env.NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID;
      const tokenId = process.env.NEXT_PUBLIC_PLATFORM_TOKEN_ID;
      
      if (!contractId || !tokenId) {
        console.warn('Contract not configured, returning false for creator status');
        return false;
      }

      // Import the contract service dynamically to avoid issues with client-side usage
      const { getCreatorRegistryService } = await import('@/lib/contract');
      const contractService = getCreatorRegistryService();
      
      const isCreator = await contractService.isCreator(hederaAccountId);
      return isCreator;
      
    } catch (error) {
      console.error('Error checking creator status:', error);
      return false;
    }
  }
}

// Authentication utilities
export class AuthService {
  static async authenticateUser(hederaAccountId: string): Promise<User | null> {
    try {
      // First, try to find existing user
      let user = await UserService.findByHederaAccountId(hederaAccountId);
      
      // If user doesn't exist, create a new one
      if (!user) {
        user = await UserService.createUser({
          hedera_account_id: hederaAccountId,
          display_name: `User ${hederaAccountId.slice(-4)}`,
        });
      }

      return user;
    } catch (error) {
      console.error('Error in authenticateUser:', error);
      return null;
    }
  }
}