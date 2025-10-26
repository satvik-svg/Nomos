'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import { useWallet } from '@/contexts/WalletContext';
import PostFeed from '@/components/posts/PostFeed';
import SearchBar from '@/components/posts/SearchBar';
import SearchResults from '@/components/posts/SearchResults';
import ContentFeedFilters, { FilterOptions } from '@/components/posts/ContentFeedFilters';
import { useToast } from '@/contexts/ToastContext';

function ExploreContent() {
  const { user } = useWallet();
  const { showSuccess, showError } = useToast();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterOptions>({
    contentType: 'all',
    sortBy: 'recent',
    creatorOnly: false
  });

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleLike = async (postId: string) => {
    if (!user) {
      showError('Authentication Required', 'Please connect your wallet to like posts');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          is_like: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      showSuccess('Success', 'Post liked!');
      // Refresh the feed
      window.location.reload();
    } catch (error) {
      console.error('Error liking post:', error);
      showError('Error', 'Failed to like post');
    }
  };

  const handleDislike = async (postId: string) => {
    if (!user) {
      showError('Authentication Required', 'Please connect your wallet to dislike posts');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          is_like: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }

      showSuccess('Success', 'Post disliked');
      // Refresh the feed
      window.location.reload();
    } catch (error) {
      console.error('Error disliking post:', error);
      showError('Error', 'Failed to dislike post');
    }
  };

  const isPremiumFilter = filters.contentType === 'all' ? undefined : filters.contentType === 'premium';
  const isSearching = searchQuery.trim().length >= 2;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Explore
            </h1>
            <p className="text-lg text-white mb-6">
              Discover trending content and new creators.
            </p>

            {/* Search Bar */}
            <SearchBar onSearch={setSearchQuery} />
          </div>

          {/* Show filters only when not searching */}
          {!isSearching && (
            <ContentFeedFilters 
              filters={filters} 
              onFilterChange={setFilters}
              showCreatorFilter={true}
            />
          )}

          {/* Conditional Rendering: Search Results or Post Feed */}
          {isSearching ? (
            <SearchResults
              query={searchQuery}
              userId={user?.id}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ) : (
            <PostFeed
              userId={user?.id}
              isPremium={isPremiumFilter}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div>Loading explore...</div>}>
      <ExploreContent />
    </Suspense>
  );
}