'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Post } from '@/types';
import PostFeed from '@/components/posts/PostFeed';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useWallet();
  const { showError } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    postCount: 0,
    totalLikes: 0,
    totalViews: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch user's posts to calculate stats
        const postsResponse = await fetch(`/api/posts?author_id=${userData.user.id}&limit=100`);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          const posts: Post[] = postsData.data || [];
          
          const totalLikes = posts.reduce((sum, post) => sum + post.like_count, 0);
          const totalViews = posts.reduce((sum, post) => sum + post.view_count, 0);
          
          setStats({
            postCount: posts.length,
            totalLikes,
            totalViews
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showError('Error', 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, showError]);

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      showError('Authentication Required', 'Please connect your wallet to like posts');
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
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
    if (!currentUser) {
      showError('Authentication Required', 'Please connect your wallet to dislike posts');
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-4">The user you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.display_name?.[0]?.toUpperCase() || user.hedera_account_id.slice(-2).toUpperCase()}
                </span>
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.display_name || `User ${user.hedera_account_id.slice(-4)}`}
                </h1>
                <p className="text-sm text-gray-600 font-mono">{user.hedera_account_id}</p>
              </div>
            </div>

            {isOwnProfile && (
              <Link
                href="/settings"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mb-4">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.postCount}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalLikes}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>

          {/* Member Since */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            Member since {new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isOwnProfile ? 'Your Posts' : 'Posts'}
          </h2>
          <PostFeed
            userId={currentUser?.id}
            authorId={user.id}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        </div>
      </div>
    </div>
  );
}
