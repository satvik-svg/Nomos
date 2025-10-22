'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post, PaginatedResponse } from '@/types';
import PostCard from './PostCard';
import { SkeletonPostCard } from '@/components/ui/Skeleton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

interface SearchResultsProps {
  query: string;
  userId?: string;
  onLike?: (postId: string) => Promise<void>;
  onDislike?: (postId: string) => Promise<void>;
}

export default function SearchResults({ 
  query, 
  userId,
  onLike,
  onDislike 
}: SearchResultsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const searchPosts = useCallback(async (searchQuery: string, pageNum: number, append: boolean = false) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        q: searchQuery.trim(),
        page: pageNum.toString(),
        limit: '20'
      });

      if (userId) params.append('user_id', userId);

      const response = await fetch(`/api/posts/search?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search posts');
      }

      const apiResponse = await response.json();
      
      // Handle new API response format with success/data wrapper
      const result: PaginatedResponse<Post> = apiResponse.success 
        ? apiResponse.data 
        : apiResponse;

      if (append) {
        setPosts(prev => [...prev, ...result.data]);
      } else {
        setPosts(result.data);
      }

      setHasMore(result.pagination.hasMore);
      setError(null);
    } catch (err) {
      console.error('Error searching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to search posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId]);

  useEffect(() => {
    setPage(1);
    searchPosts(query, 1, false);
  }, [query, searchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchPosts(query, nextPage, true);
  };

  // Update post in local state after like/dislike
  const updatePostLocally = (postId: string, updates: Partial<Post>) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  };

  // Handle like with optimistic update
  const handleLike = async (postId: string) => {
    if (!onLike) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    const wasLiked = post.user_like === true;
    const wasDisliked = post.user_like === false;
    
    updatePostLocally(postId, {
      user_like: wasLiked ? null : true,
      like_count: wasLiked ? post.like_count - 1 : post.like_count + 1,
      dislike_count: wasDisliked ? post.dislike_count - 1 : post.dislike_count
    });

    try {
      await onLike(postId);
    } catch {
      // Revert on error
      updatePostLocally(postId, {
        user_like: post.user_like,
        like_count: post.like_count,
        dislike_count: post.dislike_count
      });
    }
  };

  // Handle dislike with optimistic update
  const handleDislike = async (postId: string) => {
    if (!onDislike) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    const wasLiked = post.user_like === true;
    const wasDisliked = post.user_like === false;
    
    updatePostLocally(postId, {
      user_like: wasDisliked ? null : false,
      dislike_count: wasDisliked ? post.dislike_count - 1 : post.dislike_count + 1,
      like_count: wasLiked ? post.like_count - 1 : post.like_count
    });

    try {
      await onDislike(postId);
    } catch {
      // Revert on error
      updatePostLocally(postId, {
        user_like: post.user_like,
        like_count: post.like_count,
        dislike_count: post.dislike_count
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-600 mb-4">
          <LoadingSpinner size="sm" />
          <span>Searching...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <SkeletonPostCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Search Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600">
          No posts found matching &quot;{query}&quot;. Try different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Found {posts.length} result{posts.length !== 1 ? 's' : ''} for &quot;{query}&quot;
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            isLoading={loadingMore}
            loadingText="Loading..."
            size="lg"
          >
            Load More
          </Button>
        </div>
      )}

      {/* End of Results Message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          End of search results
        </div>
      )}
    </div>
  );
}
