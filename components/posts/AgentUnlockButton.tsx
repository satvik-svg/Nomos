'use client';

import { useState } from 'react';
import { useAgentIntegration } from '@/lib/hooks/useAgentIntegration';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';

interface AgentUnlockButtonProps {
  postId: string;
  isUnlocked: boolean;
  onUnlock: () => void;
}

export default function AgentUnlockButton({ postId, isUnlocked, onUnlock }: AgentUnlockButtonProps) {
  const { accountId, isConnected } = useWallet();
  const { requestAccess, submitPayment, getNegotiation, isLoading } = useAgentIntegration();
  const { showInfo, showSuccess, showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const negotiation = getNegotiation(postId);

  const handleUnlockRequest = async () => {
    if (!isConnected || !accountId) {
      showError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    
    try {
      showInfo('Contacting CreatorAgent...');
      
      const result = await requestAccess(postId);
      
      if (!result) {
        // Content is public
        showSuccess('Content is public, no payment required!');
        onUnlock();
        return;
      }

      if (result.status === 'offer_received' && result.offer) {
        showSuccess(
          `Offer received: ${result.offer.tokenAmount} tokens for ${result.offer.hbarPrice} HBAR`
        );
      } else if (result.status === 'denied' && result.denial) {
        showError(`Access denied: ${result.denial.reason}`);
      }
      
    } catch (error) {
      console.error('Error requesting access:', error);
      showError('Failed to contact CreatorAgent');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!negotiation?.offer) {
      return;
    }

    setIsProcessing(true);

    try {
      showInfo('Preparing payment transaction...');

      // For demo purposes, simulate payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate transaction ID
      const mockTransactionId = `0.0.${accountId}@${Date.now()}.${Math.floor(Math.random() * 1000000)}`;
      
      showInfo('Payment sent! Verifying with CreatorAgent...');

      // Submit payment proof to agent
      const result = await submitPayment(postId, mockTransactionId);

      if (result.success) {
        showSuccess(
          `Access granted! Received ${result.tokenAmount} tokens`
        );
        onUnlock();
      } else {
        showError(`Token transfer failed: ${result.error}`);
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      showError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUnlocked) {
    return (
      <div className="text-green-600 font-medium">
        ✅ Content Unlocked
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button 
        disabled 
        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
      >
        Connect Wallet to Unlock
      </button>
    );
  }

  // Show different states based on negotiation status
  if (negotiation) {
    switch (negotiation.status) {
      case 'offer_received':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              💰 Offer: {negotiation.offer?.tokenAmount} tokens for {negotiation.offer?.hbarPrice} HBAR
            </div>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : 'Approve Purchase'}
            </button>
          </div>
        );

      case 'denied':
        return (
          <div className="text-red-600">
            ❌ {negotiation.denial?.reason || 'Access denied'}
          </div>
        );

      case 'payment_pending':
        return (
          <div className="text-blue-600">
            ⏳ Verifying payment...
          </div>
        );

      case 'completed':
        return (
          <div className="text-green-600">
            ✅ Access granted!
          </div>
        );

      case 'error':
        return (
          <div className="space-y-2">
            <div className="text-red-600 text-sm">
              ❌ {negotiation.error}
            </div>
            <button
              onClick={handleUnlockRequest}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        );

      default:
        return (
          <div className="text-gray-600">
            🤖 Requesting access...
          </div>
        );
    }
  }

  // Initial state - show unlock button
  return (
    <button
      onClick={handleUnlockRequest}
      disabled={isProcessing || isLoading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing || isLoading ? '🤖 Contacting Agent...' : '🔓 Unlock Premium Content'}
    </button>
  );
}