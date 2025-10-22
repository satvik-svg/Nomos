import { NextRequest, NextResponse } from 'next/server';
import { DatabaseError } from './supabase';
import { parseError, logError, ErrorType, ErrorSeverity } from './error-handling';

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Create standardized API responses
export function createApiResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message
    },
    { status }
  );
}

export function createApiError(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details })
    },
    { status }
  );
}

// Error handler for API routes
export function handleApiError(error: unknown, context?: string): NextResponse<ApiResponse> {
  const appError = parseError(error, context);
  logError(appError, context || 'API');

  // Map error types to HTTP status codes
  let statusCode = 500;
  
  if (appError.type === ErrorType.VALIDATION) {
    statusCode = 400;
  } else if (appError.type === ErrorType.AUTHENTICATION) {
    statusCode = appError.severity === ErrorSeverity.WARNING ? 401 : 403;
  } else if (appError.type === ErrorType.DATABASE) {
    statusCode = 400;
  } else if (error instanceof DatabaseError) {
    statusCode = 400;
  }

  return createApiError(appError.userMessage, statusCode, {
    technicalDetails: appError.technicalDetails,
    recoveryAction: appError.recoveryAction,
    canRetry: appError.canRetry,
  });
}

// Middleware for API routes
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>,
  context?: string
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error, context) as NextResponse<ApiResponse<T>>;
  }
}

// Request validation utilities
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): string[] {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  return missing;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateHederaAccountId(accountId: string): boolean {
  // Hedera account ID format: 0.0.xxxxx
  const hederaRegex = /^0\.0\.\d+$/;
  return hederaRegex.test(accountId);
}

// Pagination utilities
export interface PaginationParams {
  page: number;
  limit: number;
}

export function parsePaginationParams(request: NextRequest): PaginationParams {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
  
  return { page, limit };
}

// Authentication utilities for API routes
export function extractBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring(7);
}

export function extractUserIdFromHeaders(request: NextRequest): string | null {
  // For now, we'll use a simple header-based approach
  // In production, this would validate JWT tokens
  return request.headers.get('x-user-id');
}

// Rate limiting utilities (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Content validation utilities
export function sanitizeContent(content: string): string {
  // Basic content sanitization
  return content
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, ''); // Remove HTML tags
}

export function validatePostContent(data: {
  title?: string;
  content?: string;
  is_premium?: boolean;
  price?: number;
}): string[] {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  } else if (data.content.length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }
  
  if (data.is_premium && (data.price === undefined || data.price <= 0)) {
    errors.push('Premium posts must have a price greater than 0');
  }
  
  if (data.price !== undefined && data.price < 0) {
    errors.push('Price cannot be negative');
  }
  
  return errors;
}

export function validateUserProfile(data: {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  agent_endpoint_url?: string;
  content_price_in_platform_token?: number;
}): string[] {
  const errors: string[] = [];
  
  if (data.display_name && data.display_name.length > 100) {
    errors.push('Display name must be less than 100 characters');
  }
  
  if (data.bio && data.bio.length > 500) {
    errors.push('Bio must be less than 500 characters');
  }
  
  if (data.avatar_url && !isValidUrl(data.avatar_url)) {
    errors.push('Avatar URL must be a valid URL');
  }
  
  if (data.agent_endpoint_url && !isValidUrl(data.agent_endpoint_url)) {
    errors.push('Agent endpoint URL must be a valid URL');
  }
  
  if (data.content_price_in_platform_token !== undefined && data.content_price_in_platform_token < 0) {
    errors.push('Content price cannot be negative');
  }
  
  return errors;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// CORS utilities
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  return response;
}

export function handleCorsPreflightRequest(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}