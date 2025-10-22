'use client';

import { useState } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import { useWallet } from '@/contexts/WalletContext';
import PostFeed from '@/components/posts/PostFeed';
import PostCreationModal from '@/components/posts/PostCreationModal';
import CreatePostButton from '@/components/posts/CreatePostButton';
import { useToast } from '@/contexts/ToastContext';
import { CreatePostData } from '@/types';

export default function Home() {
  const { user, isCreator } = useWallet();
  const { showSuccess, showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePost = async (postData: CreatePostData) => {
    if (!user) {
      showError('Authentication Required', 'Please connect your wallet first');
      return;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author_id: user.id,
          ...postData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      showSuccess('Success', 'Post created successfully!');
      setIsModalOpen(false);
      
      // Refresh the page to show the new post
      window.location.reload();
    } catch (error) {
      console.error('Error creating post:', error);
      showError('Error', error instanceof Error ? error.message : 'Failed to create post');
      throw error;
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      showError('Authentication Required', 'Please connect your wallet to like posts');
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          is_like: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      showError('Error', error instanceof Error ? error.message : 'Failed to like post');
      throw error;
    }
  };

  const handleDislike = async (postId: string) => {
    if (!user) {
      showError('Authentication Required', 'Please connect your wallet to dislike posts');
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          is_like: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to dislike post');
      }
    } catch (error) {
      console.error('Error disliking post:', error);
      showError('Error', error instanceof Error ? error.message : 'Failed to dislike post');
      throw error;
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Hedera Content Platform
              </h1>
              <p className="text-lg text-gray-600">
                Discover premium content from creators around the world, powered by Hedera Hashgraph.
              </p>
            </div>
            {isCreator && (
              <CreatePostButton onClick={() => setIsModalOpen(true)} />
            )}
          </div>

          {!user && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Getting Started
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Connect Your Wallet</h3>
                    <p className="text-gray-600">Connect your HashPack wallet to get started</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Explore Content</h3>
                    <p className="text-gray-600">Browse free and premium content from creators</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Become a Creator</h3>
                    <p className="text-gray-600">Pay 100 $PLATFORM tokens to start monetizing your content</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Feed */}
          <PostFeed
            userId={user?.id}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        </div>
      </div>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
        defaultPrice={user?.content_price_in_platform_token}
      />
    </div>
  );
}