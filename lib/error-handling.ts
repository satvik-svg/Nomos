/**
 * Comprehensive error handling utilities for the Hedera Content Platform
 * Provides user-friendly error messages and recovery strategies
 */

// Error types for categorization
export enum ErrorType {
  WALLET_CONNECTION = 'WALLET_CONNECTION',
  TRANSACTION = 'TRANSACTION',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

// Structured error interface
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  recoveryAction?: string;
  canRetry: boolean;
  timestamp: Date;
}

/**
 * Create a structured application error
 */
export function createAppError(
  type: ErrorType,
  message: string,
  userMessage: string,
  options?: {
    severity?: ErrorSeverity;
    technicalDetails?: string;
    recoveryAction?: string;
    canRetry?: boolean;
  }
): AppError {
  return {
    type,
    severity: options?.severity || ErrorSeverity.ERROR,
    message,
    userMessage,
    technicalDetails: options?.technicalDetails,
    recoveryAction: options?.recoveryAction,
    canRetry: options?.canRetry ?? true,
    timestamp: new Date(),
  };
}

/**
 * Parse wallet connection errors and provide user-friendly messages
 */
export function parseWalletError(error: unknown): AppError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // User rejected connection
  if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied')) {
    return createAppError(
      ErrorType.WALLET_CONNECTION,
      errorMessage,
      'Connection request was rejected',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please try connecting again and approve the request in your wallet',
        canRetry: true,
      }
    );
  }

  // No wallet found
  if (lowerMessage.includes('no wallet') || lowerMessage.includes('wallet not found')) {
    return createAppError(
      ErrorType.WALLET_CONNECTION,
      errorMessage,
      'No compatible wallet detected',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'Please install HashPack or another Hedera-compatible wallet extension',
        canRetry: false,
      }
    );
  }

  // Connection timeout
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return createAppError(
      ErrorType.WALLET_CONNECTION,
      errorMessage,
      'Connection request timed out',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please check your wallet is unlocked and try again',
        canRetry: true,
      }
    );
  }

  // Network issues
  if (lowerMessage.includes('network') || lowerMessage.includes('connection failed')) {
    return createAppError(
      ErrorType.NETWORK,
      errorMessage,
      'Network connection failed',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'Please check your internet connection and try again',
        canRetry: true,
      }
    );
  }

  // Wallet locked
  if (lowerMessage.includes('locked') || lowerMessage.includes('unlock')) {
    return createAppError(
      ErrorType.WALLET_CONNECTION,
      errorMessage,
      'Wallet is locked',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please unlock your wallet and try again',
        canRetry: true,
      }
    );
  }

  // Generic wallet error
  return createAppError(
    ErrorType.WALLET_CONNECTION,
    errorMessage,
    'Failed to connect wallet',
    {
      severity: ErrorSeverity.ERROR,
      technicalDetails: errorMessage,
      recoveryAction: 'Please ensure your wallet is installed, unlocked, and try again',
      canRetry: true,
    }
  );
}

/**
 * Parse transaction errors and provide user-friendly messages
 */
export function parseTransactionError(error: unknown): AppError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // User rejected transaction
  if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied')) {
    return createAppError(
      ErrorType.TRANSACTION,
      errorMessage,
      'Transaction was rejected',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please try again and approve the transaction in your wallet',
        canRetry: true,
      }
    );
  }

  // Insufficient balance
  if (
    lowerMessage.includes('insufficient') ||
    lowerMessage.includes('not enough') ||
    lowerMessage.includes('balance')
  ) {
    return createAppError(
      ErrorType.TRANSACTION,
      errorMessage,
      'Insufficient balance',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'Please ensure you have enough HBAR and tokens to complete this transaction',
        canRetry: false,
      }
    );
  }

  // Token not associated
  if (lowerMessage.includes('not associated') || lowerMessage.includes('token association')) {
    return createAppError(
      ErrorType.TRANSACTION,
      errorMessage,
      'Token not associated with your account',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'Please associate the token with your account first',
        canRetry: true,
      }
    );
  }

  // Allowance/approval issues
  if (lowerMessage.includes('allowance') || lowerMessage.includes('approval')) {
    return createAppError(
      ErrorType.TRANSACTION,
      errorMessage,
      'Token approval required',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'Please approve the token spending and try again',
        canRetry: true,
      }
    );
  }

  // Transaction timeout
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return createAppError(
      ErrorType.TRANSACTION,
      errorMessage,
      'Transaction timed out',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'The transaction may still be processing. Please check your wallet and try again if needed',
        canRetry: true,
      }
    );
  }

  // Network congestion
  if (lowerMessage.includes('congestion') || lowerMessage.includes('busy')) {
    return createAppError(
      ErrorType.NETWORK,
      errorMessage,
      'Network is congested',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please wait a moment and try again',
        canRetry: true,
      }
    );
  }

  // Contract execution failed
  if (lowerMessage.includes('contract') || lowerMessage.includes('execution')) {
    return createAppError(
      ErrorType.TRANSACTION,
      errorMessage,
      'Transaction execution failed',
      {
        severity: ErrorSeverity.ERROR,
        technicalDetails: errorMessage,
        recoveryAction: 'Please check the transaction requirements and try again',
        canRetry: true,
      }
    );
  }

  // Generic transaction error
  return createAppError(
    ErrorType.TRANSACTION,
    errorMessage,
    'Transaction failed',
    {
      severity: ErrorSeverity.ERROR,
      technicalDetails: errorMessage,
      recoveryAction: 'Please try again or contact support if the issue persists',
      canRetry: true,
    }
  );
}

/**
 * Parse API/network errors
 */
export function parseNetworkError(error: unknown): AppError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Network offline
  if (lowerMessage.includes('offline') || lowerMessage.includes('no internet')) {
    return createAppError(
      ErrorType.NETWORK,
      errorMessage,
      'No internet connection',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'Please check your internet connection and try again',
        canRetry: true,
      }
    );
  }

  // Server error
  if (lowerMessage.includes('500') || lowerMessage.includes('server error')) {
    return createAppError(
      ErrorType.NETWORK,
      errorMessage,
      'Server error occurred',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'Please try again in a few moments',
        canRetry: true,
      }
    );
  }

  // Rate limiting
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return createAppError(
      ErrorType.NETWORK,
      errorMessage,
      'Too many requests',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please wait a moment before trying again',
        canRetry: true,
      }
    );
  }

  // Timeout
  if (lowerMessage.includes('timeout')) {
    return createAppError(
      ErrorType.NETWORK,
      errorMessage,
      'Request timed out',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please check your connection and try again',
        canRetry: true,
      }
    );
  }

  // Generic network error
  return createAppError(
    ErrorType.NETWORK,
    errorMessage,
    'Network request failed',
    {
      severity: ErrorSeverity.ERROR,
      technicalDetails: errorMessage,
      recoveryAction: 'Please check your connection and try again',
      canRetry: true,
    }
  );
}

/**
 * Parse validation errors
 */
export function parseValidationError(error: unknown): AppError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return createAppError(
    ErrorType.VALIDATION,
    errorMessage,
    'Invalid input',
    {
      severity: ErrorSeverity.WARNING,
      technicalDetails: errorMessage,
      recoveryAction: 'Please check your input and try again',
      canRetry: true,
    }
  );
}

/**
 * Parse authentication errors
 */
export function parseAuthError(error: unknown): AppError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('not authenticated')) {
    return createAppError(
      ErrorType.AUTHENTICATION,
      errorMessage,
      'Authentication required',
      {
        severity: ErrorSeverity.WARNING,
        recoveryAction: 'Please connect your wallet to continue',
        canRetry: true,
      }
    );
  }

  if (lowerMessage.includes('forbidden') || lowerMessage.includes('not authorized')) {
    return createAppError(
      ErrorType.AUTHENTICATION,
      errorMessage,
      'Access denied',
      {
        severity: ErrorSeverity.ERROR,
        recoveryAction: 'You do not have permission to perform this action',
        canRetry: false,
      }
    );
  }

  return createAppError(
    ErrorType.AUTHENTICATION,
    errorMessage,
    'Authentication failed',
    {
      severity: ErrorSeverity.ERROR,
      technicalDetails: errorMessage,
      recoveryAction: 'Please reconnect your wallet and try again',
      canRetry: true,
    }
  );
}

/**
 * Generic error parser that attempts to categorize the error
 */
export function parseError(error: unknown, context?: string): AppError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Try to categorize based on keywords
  if (
    lowerMessage.includes('wallet') ||
    lowerMessage.includes('connect') ||
    lowerMessage.includes('hashpack')
  ) {
    return parseWalletError(error);
  }

  if (
    lowerMessage.includes('transaction') ||
    lowerMessage.includes('transfer') ||
    lowerMessage.includes('balance')
  ) {
    return parseTransactionError(error);
  }

  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('request')
  ) {
    return parseNetworkError(error);
  }

  if (lowerMessage.includes('auth') || lowerMessage.includes('permission')) {
    return parseAuthError(error);
  }

  if (lowerMessage.includes('invalid') || lowerMessage.includes('validation')) {
    return parseValidationError(error);
  }

  // Unknown error
  return createAppError(
    ErrorType.UNKNOWN,
    errorMessage,
    'An unexpected error occurred',
    {
      severity: ErrorSeverity.ERROR,
      technicalDetails: context ? `${context}: ${errorMessage}` : errorMessage,
      recoveryAction: 'Please try again or contact support if the issue persists',
      canRetry: true,
    }
  );
}

/**
 * Log error with context
 */
export function logError(error: AppError, context?: string): void {
  const prefix = context ? `[${context}]` : '';
  const timestamp = error.timestamp.toISOString();

  console.error(`${prefix} [${error.type}] [${error.severity}] ${timestamp}`);
  console.error(`Message: ${error.message}`);
  console.error(`User Message: ${error.userMessage}`);

  if (error.technicalDetails) {
    console.error(`Technical Details: ${error.technicalDetails}`);
  }

  if (error.recoveryAction) {
    console.error(`Recovery Action: ${error.recoveryAction}`);
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelay = options?.initialDelay ?? 1000;
  const maxDelay = options?.maxDelay ?? 10000;
  const backoffMultiplier = options?.backoffMultiplier ?? 2;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay);

        if (options?.onRetry) {
          options.onRetry(attempt + 1, error);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
