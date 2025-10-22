import { NextRequest } from 'next/server';
import { PostService } from '@/lib/supabase';
import { withErrorHandling, createApiResponse, createApiError } from '@/lib/api-utils';

// GET /api/posts/search - Search posts by title, content, or creator
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('user_id') || undefined;

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return createApiError('Search query is required', 400);
    }

    if (query.length < 2) {
      return createApiError('Search query must be at least 2 characters', 400);
    }

    // Validate pagination parameters
    if (page < 1) {
      return createApiError('Page must be greater than 0', 400);
    }
    if (limit < 1 || limit > 100) {
      return createApiError('Limit must be between 1 and 100', 400);
    }

    const result = await PostService.searchPosts(query.trim(), {
      page,
      limit,
      userId
    });

    return createApiResponse(result);
  }, 'GET /api/posts/search');
}
