// User data models
export interface User {
  id: string;
  hedera_account_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  agent_endpoint_url?: string;
  content_price_in_platform_token?: number;
  created_at: string;
  updated_at: string;
}

// Post data models
export interface Post {
  id: string;
  author_id: string;
  author: User;
  title: string;
  content: string;
  is_premium: boolean;
  price?: number;
  view_count: number;
  like_count: number;
  dislike_count: number;
  created_at: string;
  updated_at: string;
  user_like?: boolean | null; // Current user's like status
}

export interface PostLike {
  id: string;
  user_id: string;
  post_id: string;
  is_like: boolean;
  created_at: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  is_premium: boolean;
  price?: number;
}

// Blockchain data models
export interface HederaTransaction {
  transactionId: string;
  accountId: string;
  amount: number;
  tokenId: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface CreatorRegistration {
  userAddress: string;
  transactionId: string;
  registrationFee: number;
  timestamp: string;
}

// Context interfaces
export interface UserContext {
  user: User | null;
  isCreator: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export interface PostContext {
  posts: Post[];
  loading: boolean;
  loadMore: () => Promise<void>;
  createPost: (post: CreatePostData) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}