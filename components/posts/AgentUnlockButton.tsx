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
  const { accountId, isConnected, sendTransaction } = useWallet();
  const { requestAccess, submitPayment, getNegotiation, isLoading } = useAgentIntegration();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const negotiation = getNegotiation(postId);

  const handleUnlockRequest = async () => {
    if (!isConnected || !accountId) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    setIsProcessing(true);
    
    try {
      showToast('🤖 Contacting CreatorAgent...', 'info');
      
      const result = await requestAccess(postId);
      
      if (!result) {
        // Content is public
        showToast('Content is public, no payment required!', 'success');
        onUnlock();
        return;
      }

      if (result.status === 'offer_received' && result.offer) {
        showToast(
          `💰 Offer received: ${result.offer.tokenAmount} tokens for ${result.offer.hbarPrice} HBAR`,
          'success'
        );
      } else if (result.status === 'denied' && result.denial) {
        showToast(`❌ Access denied: ${result.denial.reason}`, 'error');
      }
      
    } catch (error) {
      console.error('Error requesting access:', error);
      showToast('Failed to contact CreatorAgent', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!negotiation?.offer || !sendTransaction) {
      return;
    }

    setIsProcessing(true);

    try {
      showToast('💳 Preparing payment transaction...', 'info');

      // Create HBAR transfer transaction
      const hbarAmount = negotiation.offer.hbarPrice;
      const creatorAccountId = negotiation.offer.tokenId.split('.')[0] + '.' + 
                              negotiation.offer.tokenId.split('.')[1] + '.' + 
                              (parseInt(negotiation.offer.tokenId.split('.')[2]) - 1); // Approximate creator account

      const transactionResponse = await sendTransaction({
        type: 'transfer',
        transfers: [
          {
            accountId: creatorAccountId,
            amount: hbarAmount
          }
        ]
      });

      if (transactionResponse.success && transactionResponse.transactionId) {
        showToast('✅ Payment sent! Verifying with CreatorAgent...', 'info');

        // Submit payment proof to agent
        const result = await submitPayment(postId, transactionResponse.transactionId);

        if (result.success) {
          showToast(
            `🎉 Access granted! Received ${result.tokenAmount} tokens`,
            'success'
          );
          onUnlock();
        } else {
          showToast(`❌ Token transfer failed: ${result.error}`, 'error');
        }
      } else {
        showToast('Payment transaction failed', 'error');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      showToast('Payment processing failed', 'error');
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