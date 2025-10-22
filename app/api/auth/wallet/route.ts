import { NextRequest, NextResponse } from 'next/server';
import { AuthService, CreatorService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Authenticate user (find existing or create new)
    const user = await AuthService.authenticateUser(accountId);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      );
    }

    // Check creator status
    const isCreator = await CreatorService.checkCreatorStatus(accountId);

    return NextResponse.json({
      user,
      isCreator,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}