import { NextRequest } from 'next/server';
import { PostService } from '@/lib/supabase';
import {
  createApiResponse,
  createApiError,
  withErrorHandling,
  parsePaginationParams,
  extractUserIdFromHeaders,
  validatePostContent,
  sanitizeContent,
  validateRequiredFields
} from '@/lib/api-utils';

// GET /api/posts - Get paginated posts
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const url = new URL(request.url);
    const { page, limit } = parsePaginationParams(request);
    const userId = extractUserIdFromHeaders(request);
    
    // Optional filters
    const authorId = url.searchParams.get('author_id') || undefined;
    const isPremium = url.searchParams.get('is_premium');
    const search = url.searchParams.get('search');

    let result;
    
    if (search) {
      // Search posts
      result = await PostService.searchPosts(search, {
        page,
        limit,
        userId: userId || undefined
      });
    } else {
      // Get regular posts
      result = await PostService.getPosts({
        page,
        limit,
        authorId,
        isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
        userId: userId || undefined
      });
    }

    return createApiResponse(result);
  });
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const userId = extractUserIdFromHeaders(request);
    
    if (!userId) {
      return createApiError('Authentication required', 401);
    }

    const body = await request.json();
    
    // Validate required fields
    const missingFields = validateRequiredFields(body, ['title', 'content']);
    if (missingFields.length > 0) {
      return createApiError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Validate post content
    const validationErrors = validatePostContent(body);
    if (validationErrors.length > 0) {
      return createApiError(`Validation errors: ${validationErrors.join(', ')}`, 400);
    }

    // Sanitize content
    const postData = {
      title: sanitizeContent(body.title),
      content: sanitizeContent(body.content),
      is_premium: Boolean(body.is_premium),
      price: body.is_premium ? Number(body.price) : undefined
    };

    const post = await PostService.createPost(userId, postData);
    
    return createApiResponse(post, 'Post created successfully', 201);
  });
}