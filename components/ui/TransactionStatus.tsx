'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export type TransactionState = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export interface TransactionStep {
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface TransactionStatusProps {
  state: TransactionState;
  steps?: TransactionStep[];
  currentStep?: number;
  message?: string;
  errorMessage?: string;
  transactionId?: string;
  onClose?: () => void;
  onRetry?: () => void;
}

export default function TransactionStatus({
  state,
  steps,
  currentStep = 0,
  message,
  errorMessage,
  transactionId,
  onClose,
  onRetry
}: TransactionStatusProps) {
  if (state === 'idle') return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {state === 'pending' && 'Processing Transaction'}
          {state === 'confirming' && 'Confirming Transaction'}
          {state === 'success' && 'Transaction Successful'}
          {state === 'error' && 'Transaction Failed'}
        </h3>
        {(state === 'success' || state === 'error') && onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Status Icon */}
      <div className="flex justify-center mb-4">
        {(state === 'pending' || state === 'confirming') && (
          <LoadingSpinner size="lg" />
        )}
        {state === 'success' && (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {state === 'error' && (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Steps Progress */}
      {steps && steps.length > 0 && (
        <div className="mb-4">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  {step.status === 'completed' && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {step.status === 'active' && (
                    <div className="w-6 h-6">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  )}
                  {step.status === 'error' && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${step.status === 'active' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <p className="text-center text-gray-600 mb-4">
          {message}
        </p>
      )}

      {/* Error Message */}
      {errorMessage && state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-800">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Transaction ID */}
      {transactionId && state === 'success' && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Transaction ID:</p>
          <p className="text-xs font-mono text-gray-800 break-all">
            {transactionId}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {state === 'error' && onRetry && (
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          )}
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {state === 'success' && onClose && (
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Done
        </button>
      )}

      {/* Pending state hint */}
      {(state === 'pending' || state === 'confirming') && (
        <p className="text-xs text-center text-gray-500 mt-4">
          Please confirm the transaction in your wallet
        </p>
      )}
    </div>
  );
}
