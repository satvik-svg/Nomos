// Integration service to connect frontend with EchoGuard agent
export interface ContentAccessRequest {
  postId: string;
  userAccountId: string;
  userEvmAddress?: string;
}

export interface ContentAccessResponse {
  success: boolean;
  negotiationId?: string;
  status?: 'offer_received' | 'denied' | 'error';
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

export interface PaymentSubmission {
  negotiationId: string;
  transactionId: string;
  hbarAmount: number;
}

export interface PaymentResult {
  success: boolean;
  tokenTransactionId?: string;
  tokenAmount?: number;
  accessGranted?: boolean;
  error?: string;
}

class AgentIntegrationService {
  private echoGuardUrl: string;

  constructor() {
    // In development, EchoGuard runs on localhost:3002
    this.echoGuardUrl = process.env.NEXT_PUBLIC_ECHOGUARD_URL || 'http://localhost:3002';
  }

  async requestContentAccess(request: ContentAccessRequest): Promise<ContentAccessResponse> {
    try {
      const response = await fetch(`${this.echoGuardUrl}/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`EchoGuard agent responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting content access:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async submitPayment(payment: PaymentSubmission): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.echoGuardUrl}/submit-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        throw new Error(`EchoGuard agent responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getNegotiationStatus(negotiationId: string): Promise<unknown> {
    try {
      const response = await fetch(`${this.echoGuardUrl}/negotiation/${negotiationId}`);
      
      if (!response.ok) {
        throw new Error(`EchoGuard agent responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting negotiation status:', error);
      return null;
    }
  }

  async checkAgentHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.echoGuardUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('EchoGuard agent health check failed:', error);
      return false;
    }
  }
}

export const agentIntegration = new AgentIntegrationService();