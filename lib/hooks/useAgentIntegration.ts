import { useState, useCallback } from 'react';
import { agentIntegration, ContentAccessRequest, PaymentSubmission } from '../agent-integration';
import { useWallet } from '@/contexts/WalletContext';

export interface AgentNegotiation {
  negotiationId: string;
  status: 'requesting' | 'offer_received' | 'denied' | 'payment_pending' | 'completed' | 'error';
  offer?: {
    tokenAmount: number;
    hbarPrice: number;
    offerId: string;
    tokenId: string;
  };
  denial?: {
    reason: string;
  };
  error?: string;
}

export function useAgentIntegration() {
  const { accountId } = useWallet();
  const [negotiations, setNegotiations] = useState<Map<string, AgentNegotiation>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const requestAccess = useCallback(async (postId: string, userEvmAddress?: string) => {
    if (!accountId) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    
    try {
      const request: ContentAccessRequest = {
        postId,
        userAccountId: accountId,
        userEvmAddress
      };

      const response = await agentIntegration.requestContentAccess(request);

      if (!response.success) {
        throw new Error(response.error || 'Failed to request access');
      }

      if (response.negotiationId) {
        const negotiation: AgentNegotiation = {
          negotiationId: response.negotiationId,
          status: response.status === 'offer_received' ? 'offer_received' : 
                  response.status === 'denied' ? 'denied' : 'error',
          offer: response.offer,
          denial: response.denial,
          error: response.error
        };

        setNegotiations(prev => new Map(prev.set(postId, negotiation)));
        return negotiation;
      }

      // If no negotiation ID, content might be public
      return null;

    } catch (error) {
      const errorNegotiation: AgentNegotiation = {
        negotiationId: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setNegotiations(prev => new Map(prev.set(postId, errorNegotiation)));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  const submitPayment = useCallback(async (postId: string, transactionId: string) => {
    const negotiation = negotiations.get(postId);
    
    if (!negotiation || !negotiation.offer) {
      throw new Error('No active negotiation found');
    }

    setIsLoading(true);

    try {
      // Update status to payment pending
      setNegotiations(prev => {
        const updated = new Map(prev);
        const current = updated.get(postId);
        if (current) {
          updated.set(postId, { ...current, status: 'payment_pending' });
        }
        return updated;
      });

      const payment: PaymentSubmission = {
        negotiationId: negotiation.negotiationId,
        transactionId,
        hbarAmount: negotiation.offer.hbarPrice
      };

      const result = await agentIntegration.submitPayment(payment);

      // Update negotiation status
      setNegotiations(prev => {
        const updated = new Map(prev);
        const current = updated.get(postId);
        if (current) {
          updated.set(postId, {
            ...current,
            status: result.success ? 'completed' : 'error',
            error: result.error
          });
        }
        return updated;
      });

      return result;

    } catch (error) {
      // Update status to error
      setNegotiations(prev => {
        const updated = new Map(prev);
        const current = updated.get(postId);
        if (current) {
          updated.set(postId, {
            ...current,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        return updated;
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [negotiations]);

  const getNegotiation = useCallback((postId: string) => {
    return negotiations.get(postId);
  }, [negotiations]);

  const clearNegotiation = useCallback((postId: string) => {
    setNegotiations(prev => {
      const updated = new Map(prev);
      updated.delete(postId);
      return updated;
    });
  }, []);

  return {
    requestAccess,
    submitPayment,
    getNegotiation,
    clearNegotiation,
    isLoading,
    negotiations: Array.from(negotiations.entries())
  };
}