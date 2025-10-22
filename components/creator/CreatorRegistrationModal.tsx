'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import { getCreatorRegistrationService, validateCreatorRegistrationConfig } from '@/lib/creator-registration';
import TransactionStatus from '@/components/ui/TransactionStatus';
import Button from '@/components/ui/Button';

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
      
      // Parse the error for user-friendly message
      const { parseTransactionError } = await import('@/lib/error-handling');
      const appError = parseTransactionError(error);
      
      const errorMessage = appError.userMessage;
      const recoveryAction = appError.recoveryAction || 'Please try again';
      
      setStatus({
        step: 'error',
        message: errorMessage,
        error: recoveryAction
      });

      // Show error toast
      showError(
        'Creator Registration Failed',
        `${errorMessage}. ${recoveryAction}`
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
                  <Button
                    onClick={handleClose}
                    variant="secondary"
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegistration}
                    fullWidth
                  >
                    Register ({registrationFee} $PLATFORM)
                  </Button>
                </div>
              </>
            )}

            {(status.step === 'associating' || status.step === 'approving' || status.step === 'registering') && (
              <TransactionStatus
                state="pending"
                steps={[
                  {
                    label: 'Associate platform token',
                    status: status.step === 'associating' ? 'active' : status.currentStep && status.currentStep > 1 ? 'completed' : 'pending'
                  },
                  {
                    label: 'Approve token spending',
                    status: status.step === 'approving' ? 'active' : status.currentStep && status.currentStep > 2 ? 'completed' : 'pending'
                  },
                  {
                    label: 'Execute creator registration',
                    status: status.step === 'registering' ? 'active' : 'pending'
                  }
                ]}
                message={status.message}
              />
            )}

            {status.step === 'success' && (
              <TransactionStatus
                state="success"
                message="You are now a registered creator!"
                transactionId={status.transactionId}
                onClose={handleClose}
              />
            )}

            {status.step === 'error' && (
              <TransactionStatus
                state="error"
                errorMessage={`${status.message}${status.error ? ': ' + status.error : ''}`}
                onClose={handleClose}
                onRetry={handleRegistration}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}