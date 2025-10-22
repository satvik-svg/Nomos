import { NextRequest, NextResponse } from 'next/server';
import { verifyCreatorStatus, reconcileCreatorStatus } from '@/lib/creator-status-verification';

/**
 * API endpoint for comprehensive creator status verification
 * Checks both blockchain and database, handles discrepancies
 * 
 * Requirements: 10.1, 10.5
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, evmAddress, forceRefresh, reconcile } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing accountId' },
        { status: 400 }
      );
    }

    console.log('Creator verification request:', {
      accountId,
      evmAddress,
      forceRefresh,
      reconcile,
    });

    // If reconcile flag is set, attempt to reconcile discrepancies
    if (reconcile) {
      const reconcileResult = await reconcileCreatorStatus(accountId, evmAddress);
      
      if (!reconcileResult.success) {
        return NextResponse.json(
          {
            error: reconcileResult.error || 'Failed to reconcile status',
            wasDiscrepancy: reconcileResult.wasDiscrepancy,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        wasDiscrepancy: reconcileResult.wasDiscrepancy,
        updatedStatus: reconcileResult.updatedStatus,
        message: reconcileResult.wasDiscrepancy
          ? 'Status reconciled successfully'
          : 'No discrepancy found',
      });
    }

    // Otherwise, just verify status
    const result = await verifyCreatorStatus({
      accountId,
      evmAddress,
      useCache: !forceRefresh,
      forceRefresh: forceRefresh || false,
    });

    return NextResponse.json({
      isCreator: result.isCreator,
      source: result.source,
      onChainStatus: result.onChainStatus,
      databaseStatus: result.databaseStatus,
      hasDiscrepancy: result.hasDiscrepancy,
      error: result.error,
    });

  } catch (error: any) {
    console.error('Creator verification API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        isCreator: false,
      },
      { status: 500 }
    );
  }
}
