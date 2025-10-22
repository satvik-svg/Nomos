import { createClient } from '@supabase/supabase-js';
import { User, Post, PostLike, CreatePostData, PaginatedResponse } from '@/types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Using mock data for development.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Utility function for handling Supabase errors
export function handleSupabaseError(error: any): DatabaseError {
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return new DatabaseError('Record not found', error.code, error);
      case '23505':
        return new DatabaseError('Record already exists', error.code, error);
      case '23503':
        return new DatabaseError('Referenced record not found', error.code, error);
      case '42501':
        return new DatabaseError('Insufficient permissions', error.code, error);
      default:
        return new DatabaseError(error.message || 'Database operation failed', error.code, error);
    }
  }
  return new DatabaseError(error?.message || 'Unknown database error', undefined, error);
}

// Configuration check utility
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

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
class UserService {
  static async findByHederaAccountId(hederaAccountId: string): Promise<User | null> {
    try {
      if (!isSupabaseConfigured()) {
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

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found - this is expected behavior
          return null;
        }
        // Handle permission errors by falling back to mock data
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.warn('Supabase permission error, using mock data:', error.message);
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
        throw handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in findByHederaAccountId:', error);
      // Fallback to mock user on any error
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
  }

  static async findById(userId: string): Promise<User | null> {
    try {
      if (!isSupabaseConfigured()) {
        return null;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in findById:', error);
      throw new DatabaseError('Failed to find user by ID');
    }
  }

  static async createUser(userData: {
    hedera_account_id: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    agent_endpoint_url?: string;
    content_price_in_platform_token?: number;
  }): Promise<User> {
    try {
      if (!isSupabaseConfigured()) {
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
        // Handle permission errors by falling back to mock data
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          console.warn('Supabase permission error, using mock data:', error.message);
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
        throw handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in createUser:', error);
      // Fallback to mock user on any error
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
  }

  static async updateUser(userId: string, updates: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    agent_endpoint_url?: string;
    content_price_in_platform_token?: number;
  }): Promise<User> {
    try {
      if (!isSupabaseConfigured()) {
        throw new DatabaseError('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in updateUser:', error);
      throw new DatabaseError('Failed to update user');
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        throw new DatabaseError('Supabase not configured');
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw handleSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in deleteUser:', error);
      throw new DatabaseError('Failed to delete user');
    }
  }

  static async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    try {
      if (!isSupabaseConfigured()) {
        return [];
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        throw handleSupabaseError(error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in searchUsers:', error);
      throw new DatabaseError('Failed to search users');
    }
  }
}

// Post management functions
class PostService {
  static async createPost(authorId: string, postData: CreatePostData): Promise<Post> {
    try {
      if (!isSupabaseConfigured()) {
        throw new DatabaseError('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          author_id: authorId,
          ...postData
        }])
        .select(`
          *,
          author:users(*)
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in createPost:', error);
      throw new DatabaseError('Failed to create post');
    }
  }

  static async getPost(postId: string, userId?: string): Promise<Post | null> {
    try {
      if (!isSupabaseConfigured()) {
        return null;
      }

      let query = supabase
        .from('posts')
        .select(`
          *,
          author:users(*)
        `)
        .eq('id', postId)
        .single();

      const { data: post, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw handleSupabaseError(error);
      }

      // Get user's like status if userId provided
      let userLike = null;
      if (userId && post) {
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('is_like')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single();
        
        userLike = likeData?.is_like ?? null;
      }

      return {
        ...post,
        user_like: userLike
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in getPost:', error);
      throw new DatabaseError('Failed to get post');
    }
  }

  static async getPosts(options: {
    page?: number;
    limit?: number;
    authorId?: string;
    isPremium?: boolean;
    userId?: string;
  } = {}): Promise<PaginatedResponse<Post>> {
    try {
      const { page = 1, limit = 20, authorId, isPremium, userId } = options;
      const offset = (page - 1) * limit;

      if (!isSupabaseConfigured()) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            hasMore: false
          }
        };
      }

      let query = supabase
        .from('posts')
        .select(`
          *,
          author:users(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (authorId) {
        query = query.eq('author_id', authorId);
      }

      if (isPremium !== undefined) {
        query = query.eq('is_premium', isPremium);
      }

      const { data: posts, error, count } = await query;

      if (error) {
        throw handleSupabaseError(error);
      }

      // Get user like statuses if userId provided
      let postsWithLikes = posts || [];
      if (userId && posts && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id, is_like')
          .eq('user_id', userId)
          .in('post_id', postIds);

        const likesMap = new Map(likes?.map(l => [l.post_id, l.is_like]) || []);
        
        postsWithLikes = posts.map(post => ({
          ...post,
          user_like: likesMap.get(post.id) ?? null
        }));
      }

      return {
        data: postsWithLikes,
        pagination: {
          page,
          limit,
          total: count || 0,
          hasMore: (count || 0) > offset + limit
        }
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in getPosts:', error);
      throw new DatabaseError('Failed to get posts');
    }
  }

  static async updatePost(postId: string, authorId: string, updates: Partial<CreatePostData>): Promise<Post> {
    try {
      if (!isSupabaseConfigured()) {
        throw new DatabaseError('Supabase not configured');
      }

      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .eq('author_id', authorId) // Ensure only author can update
        .select(`
          *,
          author:users(*)
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in updatePost:', error);
      throw new DatabaseError('Failed to update post');
    }
  }

  static async deletePost(postId: string, authorId: string): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        throw new DatabaseError('Supabase not configured');
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', authorId); // Ensure only author can delete

      if (error) {
        throw handleSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in deletePost:', error);
      throw new DatabaseError('Failed to delete post');
    }
  }

  static async incrementViewCount(postId: string): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        return;
      }

      const { error } = await supabase.rpc('increment_post_view_count', {
        post_uuid: postId
      });

      if (error) {
        console.error('Error incrementing view count:', error);
        // Don't throw error for view count failures
      }
    } catch (error) {
      console.error('Error in incrementViewCount:', error);
      // Don't throw error for view count failures
    }
  }

  static async searchPosts(query: string, options: {
    page?: number;
    limit?: number;
    userId?: string;
  } = {}): Promise<PaginatedResponse<Post>> {
    try {
      const { page = 1, limit = 20, userId } = options;
      const offset = (page - 1) * limit;

      if (!isSupabaseConfigured()) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            hasMore: false
          }
        };
      }

      const { data: posts, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          author:users(*)
        `, { count: 'exact' })
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw handleSupabaseError(error);
      }

      // Get user like statuses if userId provided
      let postsWithLikes = posts || [];
      if (userId && posts && posts.length > 0) {
        const postIds = posts.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id, is_like')
          .eq('user_id', userId)
          .in('post_id', postIds);

        const likesMap = new Map(likes?.map(l => [l.post_id, l.is_like]) || []);
        
        postsWithLikes = posts.map(post => ({
          ...post,
          user_like: likesMap.get(post.id) ?? null
        }));
      }

      return {
        data: postsWithLikes,
        pagination: {
          page,
          limit,
          total: count || 0,
          hasMore: (count || 0) > offset + limit
        }
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in searchPosts:', error);
      throw new DatabaseError('Failed to search posts');
    }
  }
}

// Post interaction functions
class PostInteractionService {
  static async likePost(userId: string, postId: string, isLike: boolean): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        throw new DatabaseError('Supabase not configured');
      }

      // Check if user already liked/disliked this post
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Update existing like/dislike
        const { error } = await supabase
          .from('post_likes')
          .update({ is_like: isLike })
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (error) {
          throw handleSupabaseError(error);
        }
      } else {
        // Create new like/dislike
        const { error } = await supabase
          .from('post_likes')
          .insert([{
            user_id: userId,
            post_id: postId,
            is_like: isLike
          }]);

        if (error) {
          throw handleSupabaseError(error);
        }
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in likePost:', error);
      throw new DatabaseError('Failed to like/dislike post');
    }
  }

  static async removeLike(userId: string, postId: string): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        throw new DatabaseError('Supabase not configured');
      }

      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) {
        throw handleSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in removeLike:', error);
      throw new DatabaseError('Failed to remove like');
    }
  }

  static async getUserLikeStatus(userId: string, postId: string): Promise<boolean | null> {
    try {
      if (!isSupabaseConfigured()) {
        return null;
      }

      const { data, error } = await supabase
        .from('post_likes')
        .select('is_like')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw handleSupabaseError(error);
      }

      return data?.is_like ?? null;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in getUserLikeStatus:', error);
      return null;
    }
  }
}

// Creator status checking
class CreatorService {
  static async checkCreatorStatus(hederaAccountId: string, evmAddress?: string): Promise<boolean> {
    try {
      console.log('Checking creator status for account:', hederaAccountId);
      
      // Check if contract configuration is available
      const contractId = process.env.NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID;
      const tokenId = process.env.NEXT_PUBLIC_PLATFORM_TOKEN_ID;
      
      console.log('Contract configuration:', { contractId, tokenId });
      
      if (!contractId || !tokenId) {
        console.warn('Contract not configured, returning false for creator status');
        return false;
      }

      // Get EVM address from multiple sources (in order of preference)
      let addressToCheck = evmAddress;
      
      // Try environment variable
      if (!addressToCheck) {
        addressToCheck = process.env.NEXT_PUBLIC_EVM_ADDRESS;
      }
      
      // Try localStorage (set by wallet)
      if (!addressToCheck && typeof window !== 'undefined') {
        addressToCheck = localStorage.getItem(`evm_address_${hederaAccountId}`) || undefined;
      }

      if (!addressToCheck) {
        console.warn('No EVM address available for creator status check');
        return false;
      }

      console.log('Using EVM address for check:', addressToCheck);

      // Check cache first
      const { getCreatorStatusCache } = await import('@/lib/creator-status-cache');
      const cachedStatus = getCreatorStatusCache(hederaAccountId, addressToCheck);
      
      if (cachedStatus !== null) {
        console.log('Using cached creator status:', cachedStatus);
        return cachedStatus;
      }

      // Try to query from contract
      const { queryCreatorStatus } = await import('@/lib/contract-query');
      const result = await queryCreatorStatus(hederaAccountId, addressToCheck);
      
      if (result.error) {
        console.error('Creator status query error:', result.error);
        console.warn('⚠️ Cannot verify creator status automatically.');
        console.warn('If you have registered, manually set status with:');
        console.warn(`localStorage.setItem('creator_status_${hederaAccountId}_${addressToCheck}', JSON.stringify({isCreator: true, timestamp: Date.now(), evmAddress: '${addressToCheck}'}));`);
        return false;
      }
      
      // Cache the result
      const { setCreatorStatusCache } = await import('@/lib/creator-status-cache');
      setCreatorStatusCache(hederaAccountId, addressToCheck, result.isCreator);
      
      console.log('Creator status result:', { hederaAccountId, evmAddress: addressToCheck, isCreator: result.isCreator });
      return result.isCreator;
      
    } catch (error) {
      console.error('Error checking creator status:', error);
      return false;
    }
  }
}

// Authentication utilities
class AuthService {
  static async authenticateUser(hederaAccountId: string): Promise<User> {
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
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('Error in authenticateUser:', error);
      throw new DatabaseError('Failed to authenticate user');
    }
  }

  static async validateUserSession(userId: string): Promise<User | null> {
    try {
      return await UserService.findById(userId);
    } catch (error) {
      console.error('Error validating user session:', error);
      return null;
    }
  }
}

// Database health and utility functions
class DatabaseUtils {
  static async checkConnection(): Promise<boolean> {
    try {
      if (!isSupabaseConfigured()) {
        return false;
      }

      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }

  static async getStats(): Promise<{
    userCount: number;
    postCount: number;
    likeCount: number;
  }> {
    try {
      if (!isSupabaseConfigured()) {
        return { userCount: 0, postCount: 0, likeCount: 0 };
      }

      const [
        { count: userCount },
        { count: postCount },
        { count: likeCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('post_likes').select('*', { count: 'exact', head: true })
      ]);

      return {
        userCount: userCount || 0,
        postCount: postCount || 0,
        likeCount: likeCount || 0
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { userCount: 0, postCount: 0, likeCount: 0 };
    }
  }

  static async cleanupOrphanedRecords(): Promise<void> {
    try {
      if (!isSupabaseConfigured()) {
        return;
      }

      // Clean up post_likes for deleted posts
      await supabase
        .from('post_likes')
        .delete()
        .not('post_id', 'in', `(SELECT id FROM posts)`);

      // Clean up posts for deleted users
      await supabase
        .from('posts')
        .delete()
        .not('author_id', 'in', `(SELECT id FROM users)`);

    } catch (error) {
      console.error('Error cleaning up orphaned records:', error);
    }
  }
}

// Export all services for easy importing
export {
  supabase as default,
  UserService,
  PostService,
  PostInteractionService,
  CreatorService,
  AuthService,
  DatabaseUtils
};