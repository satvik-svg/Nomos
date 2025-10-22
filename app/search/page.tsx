'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import { useWallet } from '@/contexts/WalletContext';
import SearchBar from '@/components/posts/SearchBar';
import SearchResults from '@/components/posts/SearchResults';
import { useToast } from '@/contexts/ToastContext';

export default function SearchPage() {
  const { user } = useWallet();
  const { showSuccess, showError } = useToast();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

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
    } catch (error) {
      console.error('Error disliking post:', error);
      showError('Error', 'Failed to dislike post');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Find posts by title, content, or creator name.
            </p>

            {/* Search Bar */}
            <SearchBar onSearch={setSearchQuery} autoFocus={true} />
          </div>

          {/* Search Results or Empty State */}
          {searchQuery.trim().length >= 2 ? (
            <SearchResults
              query={searchQuery}
              userId={user?.id}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Searching</h3>
              <p className="text-gray-600">
                Enter at least 2 characters to search for posts.
              </p>
              <div className="mt-6 text-sm text-gray-500">
                <p className="font-medium mb-2">Search tips:</p>
                <ul className="space-y-1">
                  <li>• Search by post title or content</li>
                  <li>• Search by creator name</li>
                  <li>• Use specific keywords for better results</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
