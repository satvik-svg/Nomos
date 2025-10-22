import { NextRequest } from 'next/server';
import { PostInteractionService } from '@/lib/supabase';
import {
  createApiResponse,
  createApiError,
  withErrorHandling,
  extractUserIdFromHeaders
} from '@/lib/api-utils';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/posts/[id]/like - Like or dislike a post
export async function POST(request: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const { id: postId } = await params;
    const userId = extractUserIdFromHeaders(request);
    
    if (!userId) {
      return createApiError('Authentication required', 401);
    }

    const body = await request.json();
    const { is_like } = body;
    
    if (typeof is_like !== 'boolean') {
      return createApiError('is_like must be a boolean value', 400);
    }

    await PostInteractionService.likePost(userId, postId, is_like);
    
    return createApiResponse(
      { is_like },
      `Post ${is_like ? 'liked' : 'disliked'} successfully`
    );
  });
}

// DELETE /api/posts/[id]/like - Remove like/dislike from a post
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const { id: postId } = await params;
    const userId = extractUserIdFromHeaders(request);
    
    if (!userId) {
      return createApiError('Authentication required', 401);
    }

    await PostInteractionService.removeLike(userId, postId);
    
    return createApiResponse(null, 'Like removed successfully');
  });
}

// GET /api/posts/[id]/like - Get user's like status for a post
export async function GET(request: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const { id: postId } = await params;
    const userId = extractUserIdFromHeaders(request);
    
    if (!userId) {
      return createApiError('Authentication required', 401);
    }

    const likeStatus = await PostInteractionService.getUserLikeStatus(userId, postId);
    
    return createApiResponse({ is_like: likeStatus });
  });
}