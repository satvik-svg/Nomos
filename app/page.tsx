'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import { useWallet } from '@/contexts/WalletContext';
import PostFeed from '@/components/posts/PostFeed';
import PostCreationModal from '@/components/posts/PostCreationModal';
import CreatePostButton from '@/components/posts/CreatePostButton';
import { useToast } from '@/contexts/ToastContext';
import { CreatePostData, User } from '@/types';
import WalletConnect from '@/components/wallet/WalletConnect';
import Link from 'next/link';

export default function Home() {
  const { user, isCreator, isConnected } = useWallet();
  const { showSuccess, showError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedCreators, setSuggestedCreators] = useState<User[]>([]);

  // Fetch suggested creators
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const response = await fetch('/api/users?is_creator=true&limit=3');
        if (response.ok) {
          const data = await response.json();
          setSuggestedCreators(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching creators:', error);
      }
    };

    fetchCreators();
  }, []);

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
    <div className="flex min-h-screen max-w-[1280px] mx-auto">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Feed */}
      <main className="flex-1 min-w-0 border-x border-gray-200 dark:border-gray-800 min-h-screen">
        {/* Header with Tabs */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home</h1>
          </div>
        </div>

        {/* Tweet Composer */}
        {isConnected && user && (
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 pt-4 pb-2">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full text-left text-gray-500 dark:text-gray-400 text-xl py-3 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  What's happening?
                </button>
                
                {/* Composer Tools */}
                <div className="flex items-center justify-between mt-3 pb-2">
                  <div className="flex items-center gap-1">
                    {/* Image */}
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-[#1d9bf0] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {/* GIF */}
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-[#1d9bf0] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </button>
                    {/* Poll */}
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-[#1d9bf0] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    {/* Emoji */}
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-[#1d9bf0] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    {/* Schedule */}
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-[#1d9bf0] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {/* Location */}
                    <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-[#1d9bf0] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-1.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full transition-colors text-sm"
                  >
                    Post
                  </button>
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

        {/* Create Post Modal */}
        {isModalOpen && (
          <PostCreationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreatePost}
          />
        )}
      </main>

      {/* Right Sidebar - Trends/Suggestions */}
      <aside className="hidden xl:block w-[350px] px-4 py-2">
        <div className="sticky top-2 space-y-4">
          {/* Search Bar */}
          <div className="pt-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Subscribe to Premium / Connect Wallet */}
          {!isConnected ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-900 dark:text-white text-[15px] mb-3 leading-5">
                Connect your Hedera wallet to start posting and engaging with content on Nomos.
              </p>
              <WalletConnect />
            </div>
          ) : isCreator ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Creator Dashboard
              </h2>
              <p className="text-gray-900 dark:text-white text-[15px] mb-3 leading-5">
                You're a verified creator. Manage your content and earnings.
              </p>
              <Link 
                href="/creator/settings"
                className="inline-block px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full transition-colors text-[15px]"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Become a Creator
              </h2>
              <p className="text-gray-900 dark:text-white text-[15px] mb-3 leading-5">
                Pay 100 $PLATFORM tokens to start monetizing your content on Nomos.
              </p>
              <Link 
                href="/creator/settings"
                className="inline-block px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold rounded-full transition-colors text-[15px]"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* What's happening */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white px-4 py-3">
              What's happening
            </h2>
            <div className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer px-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-[13px] text-gray-500 dark:text-gray-400">
                    Trending in Crypto
                  </div>
                  <div className="font-bold text-[15px] text-gray-900 dark:text-white mt-0.5">
                    #Hedera
                  </div>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                    1.2K posts
                  </div>
                </div>
                <button className="p-1 hover:bg-[#1d9bf0]/10 rounded-full text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer px-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-[13px] text-gray-500 dark:text-gray-400">
                    Trending in Tech
                  </div>
                  <div className="font-bold text-[15px] text-gray-900 dark:text-white mt-0.5">
                    #Web3
                  </div>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                    5.6K posts
                  </div>
                </div>
                <button className="p-1 hover:bg-[#1d9bf0]/10 rounded-full text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer px-4 py-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-[13px] text-gray-500 dark:text-gray-400">
                    Trending
                  </div>
                  <div className="font-bold text-[15px] text-gray-900 dark:text-white mt-0.5">
                    #ContentCreators
                  </div>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                    891 posts
                  </div>
                </div>
                <button className="p-1 hover:bg-[#1d9bf0]/10 rounded-full text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer px-4 py-3 text-[15px] text-[#1d9bf0]">
              Show more
            </div>
          </div>

          {/* Who to follow */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white px-4 py-3">
              Who to follow
            </h2>
            {suggestedCreators.length > 0 ? (
              <>
                {suggestedCreators.map((creator, index) => (
                  <Link 
                    key={creator.id}
                    href={`/users/${creator.id}`}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer px-4 py-3 block"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${
                            index === 0 ? '#a855f7, #ec4899' :
                            index === 1 ? '#3b82f6, #06b6d4' :
                            '#10b981, #84cc16'
                          })`
                        }}
                      >
                        {creator.display_name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[15px] text-gray-900 dark:text-white truncate flex items-center gap-1">
                          {creator.display_name || 'Creator'}
                          <svg className="w-[18px] h-[18px] text-[#1d9bf0]" viewBox="0 0 22 22" fill="currentColor">
                            <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                          </svg>
                        </div>
                        <div className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                          @{creator.hedera_account_id?.slice(-8) || 'creator'}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Follow functionality can be added later
                        }}
                        className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-[14px]"
                      >
                        Follow
                      </button>
                    </div>
                  </Link>
                ))}
                <Link 
                  href="/creators"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer px-4 py-3 text-[15px] text-[#1d9bf0] block"
                >
                  Show more
                </Link>
              </>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-[15px]">
                No creators to show yet
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}