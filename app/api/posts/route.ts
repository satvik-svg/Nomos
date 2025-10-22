import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/lib/supabase';
import { CreatePostData } from '@/types';
import { withErrorHandling, createApiResponse, createApiError } from '@/lib/api-utils';

// GET /api/posts - Get paginated posts
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const authorId = searchParams.get('author_id') || undefined;
    const isPremiumParam = searchParams.get('is_premium');
    const userId = searchParams.get('user_id') || undefined;

    // Validate pagination parameters
    if (page < 1) {
      return createApiError('Page must be greater than 0', 400);
    }
    if (limit < 1 || limit > 100) {
      return createApiError('Limit must be between 1 and 100', 400);
    }

    // Parse isPremium parameter
    let isPremium: boolean | undefined;
    if (isPremiumParam === 'true') {
      isPremium = true;
    } else if (isPremiumParam === 'false') {
      isPremium = false;
    }

    const result = await PostService.getPosts({
      page,
      limit,
      authorId,
      isPremium,
      userId
    });

    return createApiResponse(result);
  }, 'GET /api/posts');
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { author_id, title, content, is_premium, price } = body;

    // Validate required fields
    if (!author_id) {
      return createApiError('Author ID is required', 400);
    }

    if (!title || !title.trim()) {
      return createApiError('Title is required', 400);
    }

    if (!content || !content.trim()) {
      return createApiError('Content is required', 400);
    }

    // Validate title length
    if (title.length < 3) {
      return createApiError('Title must be at least 3 characters', 400);
    }

    if (title.length > 200) {
      return createApiError('Title must be less than 200 characters', 400);
    }

    // Validate content length
    if (content.length < 10) {
      return createApiError('Content must be at least 10 characters', 400);
    }

    // Validate price for premium content
    if (is_premium) {
      if (price === undefined || price === null) {
        return createApiError('Price is required for premium content', 400);
      }

      if (price <= 0) {
        return createApiError('Price must be greater than 0', 400);
      }

      if (price > 1000000) {
        return createApiError('Price must be less than 1,000,000', 400);
      }
    }

    const postData: CreatePostData = {
      title: title.trim(),
      content: content.trim(),
      is_premium: is_premium || false,
      price: is_premium ? price : undefined
    };

    const post = await PostService.createPost(author_id, postData);

    return createApiResponse(post, 'Post created successfully', 201);
  }, 'POST /api/posts');
}
