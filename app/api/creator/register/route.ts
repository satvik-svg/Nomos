import { NextRequest } from 'next/server';
import { CreatorService } from '@/lib/supabase';
import { withErrorHandling, createApiResponse, createApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { accountId, transactionId } = body;

    if (!accountId) {
      return createApiError('Account ID is required', 400);
    }

    if (!transactionId) {
      return createApiError('Transaction ID is required', 400);
    }

    // Verify creator status on-chain
    const isCreator = await CreatorService.checkCreatorStatus(accountId);

    if (!isCreator) {
      return createApiError(
        'Creator status not confirmed on-chain. Please ensure the transaction was successful.',
        400
      );
    }

    return createApiResponse(
      { isCreator: true },
      'Creator registration confirmed'
    );
  }, 'POST /api/creator/register');
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return createApiError('Account ID is required', 400);
    }

    // Check creator status on-chain
    const isCreator = await CreatorService.checkCreatorStatus(accountId);

    return createApiResponse({
      accountId,
      isCreator
    });
  }, 'GET /api/creator/register');
}