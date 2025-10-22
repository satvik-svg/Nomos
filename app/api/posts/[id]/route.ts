import { NextRequest } from 'next/server';
import { PostService } from '@/lib/supabase';
import {
  createApiResponse,
  createApiError,
  withErrorHandling,
  extractUserIdFromHeaders,
  validatePostContent,
  sanitizeContent
} from '@/lib/api-utils';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/posts/[id] - Get a specific post
export async function GET(request: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const userId = extractUserIdFromHeaders(request);
    
    const post = await PostService.getPost(id, userId || undefined);
    
    if (!post) {
      return createApiError('Post not found', 404);
    }

    // Increment view count (fire and forget)
    PostService.incrementViewCount(id).catch(console.error);
    
    return createApiResponse(post);
  });
}

// PUT /api/posts/[id] - Update a post
export async function PUT(request: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const userId = extractUserIdFromHeaders(request);
    
    if (!userId) {
      return createApiError('Authentication required', 401);
    }

    const body = await request.json();
    
    // Validate post content
    const validationErrors = validatePostContent(body);
    if (validationErrors.length > 0) {
      return createApiError(`Validation errors: ${validationErrors.join(', ')}`, 400);
    }

    // Sanitize content
    const updates: any = {};
    if (body.title !== undefined) {
      updates.title = sanitizeContent(body.title);
    }
    if (body.content !== undefined) {
      updates.content = sanitizeContent(body.content);
    }
    if (body.is_premium !== undefined) {
      updates.is_premium = Boolean(body.is_premium);
    }
    if (body.price !== undefined) {
      updates.price = Number(body.price);
    }

    const post = await PostService.updatePost(id, userId, updates);
    
    return createApiResponse(post, 'Post updated successfully');
  });
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const userId = extractUserIdFromHeaders(request);
    
    if (!userId) {
      return createApiError('Authentication required', 401);
    }

    await PostService.deletePost(id, userId);
    
    return createApiResponse(null, 'Post deleted successfully');
  });
}