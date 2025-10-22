'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import { getCreatorRegistrationService, validateCreatorRegistrationConfig } from '@/lib/creator-registration';

interface CreatorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TransactionStep = 'idle' | 'associating' | 'approving' | 'registering' | 'success' | 'error';

interface TransactionStatus {
  step: TransactionStep;
  message: string;
  error?: string;
  transactionId?: string;
  currentStep?: number;
  totalSteps?: number;
}

export default function CreatorRegistrationModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreatorRegistrationModalProps) {
  const { accountId, user } = useWallet();
  const { showSuccess, showError } = useToast();
  const [status, setStatus] = useState<TransactionStatus>({
    step: 'idle',
    message: ''
  });

  const registrationFee = 100; // $PLATFORM tokens

  const handleRegistration = async () => {
    if (!accountId || !user) {
      setStatus({
        step: 'error',
        message: 'Wallet not connected',
        error: 'Please connect your wallet first'
      });
      return;
    }

    // Validate configuration
    const configValidation = validateCreatorRegistrationConfig();
    if (!configValidation.isValid) {
      setStatus({
        step: 'error',
        message: 'Configuration error',
        error: `Missing configuration: ${configValidation.missingVars.join(', ')}`
      });
      return;
    }

    try {
      const registrationService = getCreatorRegistrationService();

      // Step 1: Token Association
      setStatus({
        step: 'associating',
        message: 'Associating platform token with your account...',
        currentStep: 1,
        totalSteps: 3
      });

      // Step 2: Token Approval
      setStatus({
        step: 'approving',
        message: 'Approving token spending for registration fee...',
        currentStep: 2,
        totalSteps: 3
      });

      // Step 3: Registration
      setStatus({
        step: 'registering',
        message: 'Executing creator registration...',
        currentStep: 3,
        totalSteps: 3
      });

      // Execute the full registration process
      const result = await registrationService.registerAsCreator(accountId);

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      // Success
      setStatus({
        step: 'success',
        message: 'Registration successful!',
        transactionId: result.transactionId
      });

      // Show success toast
      showSuccess(
        'Creator Registration Successful!',
        'You are now a registered creator and can post premium content.'
      );

      // Call success callback to refresh user data, then close after delay
      await onSuccess();
      
      setTimeout(() => {
        onClose();
        resetModal();
      }, 2000);

    } catch (error) {
      console.error('Creator registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setStatus({
        step: 'error',
        message: 'Registration failed',
        error: errorMessage
      });

      // Show error toast
      showError(
        'Creator Registration Failed',
        errorMessage
      );
    }
  };

  const resetModal = () => {
    setStatus({
      step: 'idle',
      message: ''
    });
  };

  const handleClose = () => {
    if (status.step === 'associating' || status.step === 'approving' || status.step === 'registering') {
      // Don't allow closing during transactions
      return;
    }
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Become a Creator
            </h2>
            {status.step !== 'associating' && status.step !== 'approving' && status.step !== 'registering' && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {status.step === 'idle' && (
              <>
                <div className="text-gray-600">
                  <p className="mb-4">
                    Register as a creator to start monetizing your content. 
                    This requires a one-time payment of {registrationFee} $PLATFORM tokens.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-blue-900 mb-2">What you&apos;ll get:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Ability to post premium content</li>
                      <li>• Set custom pricing for your posts</li>
                      <li>• Creator badge on your profile</li>
                      <li>• Access to creator analytics</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">Transaction Process:</h3>
                    <ol className="text-sm text-yellow-800 space-y-1">
                      <li>1. Approve {registrationFee} $PLATFORM tokens</li>
                      <li>2. Execute creator registration</li>
                      <li>3. Receive creator status</li>
                    </ol>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegistration}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Register ({registrationFee} $PLATFORM)
                  </button>
                </div>
              </>
            )}

            {(status.step === 'associating' || status.step === 'approving' || status.step === 'registering') && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {status.step === 'associating' && 'Associating Token'}
                  {status.step === 'approving' && 'Approving Tokens'}
                  {status.step === 'registering' && 'Registering Creator'}
                </h3>
                {status.currentStep && status.totalSteps && (
                  <p className="text-sm text-gray-500 mb-2">
                    Step {status.currentStep} of {status.totalSteps}
                  </p>
                )}
                <p className="text-gray-600">{status.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please confirm the transaction in your wallet...
                </p>
              </div>
            )}

            {status.step === 'success' && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 mb-4">{status.message}</p>
                {status.transactionId && (
                  <p className="text-sm text-gray-500 font-mono">
                    Transaction: {status.transactionId}
                  </p>
                )}
                <p className="text-sm text-green-600 mt-2">
                  You are now a registered creator!
                </p>
              </div>
            )}

            {status.step === 'error' && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Registration Failed
                </h3>
                <p className="text-gray-600 mb-2">{status.message}</p>
                {status.error && (
                  <p className="text-sm text-red-600 mb-4">{status.error}</p>
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleRegistration}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}