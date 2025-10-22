import { DatabaseUtils } from '@/lib/supabase';
import { createApiResponse, createApiError, withErrorHandling } from '@/lib/api-utils';

// GET /api/health - Check database connection and get basic stats
export async function GET() {
  return withErrorHandling(async () => {
    const isConnected = await DatabaseUtils.checkConnection();
    
    if (!isConnected) {
      return createApiError('Database connection failed', 503);
    }

    const stats = await DatabaseUtils.getStats();
    
    return createApiResponse({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      stats
    });
  });
}