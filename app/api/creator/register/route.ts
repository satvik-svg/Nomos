import { NextRequest, NextResponse } from 'next/server';
import { CreatorService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, transactionId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Verify creator status on-chain
    const isCreator = await CreatorService.checkCreatorStatus(accountId);

    if (!isCreator) {
      return NextResponse.json(
        { error: 'Creator status not confirmed on-chain' },
        { status: 400 }
      );
    }

    // TODO: Update user record in database if needed
    // For now, we rely on the on-chain status check

    return NextResponse.json({
      success: true,
      message: 'Creator registration confirmed',
      isCreator: true
    });

  } catch (error) {
    console.error('Creator registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Check creator status on-chain
    const isCreator = await CreatorService.checkCreatorStatus(accountId);

    return NextResponse.json({
      accountId,
      isCreator
    });

  } catch (error) {
    console.error('Creator status check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}