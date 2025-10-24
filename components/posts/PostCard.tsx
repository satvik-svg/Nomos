'use client';

import { useState } from 'react';
import { Post } from '@/types';
import Link from 'next/link';
import CreatorBadge from '@/components/creator/CreatorBadge';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => Promise<void>;
  onDislike?: (postId: string) => Promise<void>;
}

export default function PostCard({ post, onLike, onDislike }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLike = async () => {
    if (!onLike || isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (!onDislike || isDisliking) return;
    setIsDisliking(true);
    try {
      await onDislike(post.id);
    } finally {
      setIsDisliking(false);
    }
  };

  return (
    <article className="border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors cursor-pointer">
      <div className="flex gap-2 sm:gap-3">
        {/* Avatar */}
        <Link href={`/users/${post.author_id}`} className="flex-shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
            {post.author?.display_name?.[0]?.toUpperCase() || 'U'}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 text-sm sm:text-[15px] leading-5 flex-wrap">
            <Link 
              href={`/users/${post.author_id}`}
              className="font-bold text-gray-900 dark:text-white hover:underline truncate max-w-[120px] sm:max-w-none"
            >
              {post.author?.display_name || 'Anonymous'}
            </Link>
            {post.author?.is_creator && (
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#1d9bf0]" viewBox="0 0 22 22" fill="currentColor">
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              </div>
            )}
            <span className="text-gray-500 dark:text-gray-400 truncate text-xs sm:text-sm">
              @{post.author?.hedera_account_id?.slice(-8) || 'unknown'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">·</span>
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 text-xs sm:text-sm">
              {formatDate(post.created_at)}
            </span>
            {post.is_premium && (
              <>
                <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">·</span>
                <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-500 text-xs sm:text-sm font-medium flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {post.price}
                </span>
              </>
            )}
          </div>

          {/* Title & Content */}
          <Link href={`/posts/${post.id}`} className="block mt-1">
            {post.title && (
              <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 dark:text-white leading-5 sm:leading-6 mb-1">
                {post.title}
              </h3>
            )}
            <p className="text-sm sm:text-[15px] text-gray-900 dark:text-white leading-5 whitespace-pre-wrap break-words">
              {post.is_premium && post.content.length > 150 
                ? `${post.content.substring(0, 150)}...` 
                : post.content}
            </p>
            {post.is_premium && post.content.length > 150 && (
              <span className="text-[#1d9bf0] hover:underline text-sm sm:text-[15px]">
                Read more
              </span>
            )}
          </Link>

          {/* Actions */}
          <div className="flex items-center justify-between mt-2 sm:mt-3 max-w-md">
            {/* Views */}
            <div className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400 group">
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-[#1d9bf0] transition-colors">
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-xs sm:text-[13px]">{post.view_count}</span>
            </div>

            {/* Comment - placeholder */}
            <div className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400 group cursor-pointer">
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-[#1d9bf0] transition-colors">
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs sm:text-[13px]">0</span>
            </div>

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400 group disabled:opacity-50"
            >
              <div className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                post.user_like === true
                  ? 'text-pink-600 bg-pink-50 dark:bg-pink-950'
                  : 'group-hover:bg-pink-50 dark:group-hover:bg-pink-950 group-hover:text-pink-600'
              }`}>
                <svg 
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]" 
                  fill={post.user_like === true ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className={`text-xs sm:text-[13px] ${post.user_like === true ? 'text-pink-600' : ''}`}>
                {post.like_count}
              </span>
            </button>

            {/* Dislike */}
            <button
              onClick={handleDislike}
              disabled={isDisliking}
              className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400 group disabled:opacity-50"
            >
              <div className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                post.user_like === false
                  ? 'text-red-600 bg-red-50 dark:bg-red-950'
                  : 'group-hover:bg-red-50 dark:group-hover:bg-red-950 group-hover:text-red-600'
              }`}>
                <svg 
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px]" 
                  fill={post.user_like === false ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v3.75h4.5a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-4.5v3.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V12h-3.75a.75.75 0 01-.75-.75v-.75a.75.75 0 01.75-.75h3.75z" transform="rotate(45 12 12)" />
                </svg>
              </div>
              <span className={`text-xs sm:text-[13px] ${post.user_like === false ? 'text-red-600' : ''}`}>
                {post.dislike_count}
              </span>
            </button>

            {/* Share */}
            <div className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400 group cursor-pointer">
              <div className="p-1.5 sm:p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-950 group-hover:text-green-600 transition-colors">
                <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}