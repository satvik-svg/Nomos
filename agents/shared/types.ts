// A2A Message Types for Agent Communication
export interface A2AMessage {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  type: string;
  data: any;
}

export interface ContentInquiry extends A2AMessage {
  type: 'content_inquiry';
  data: {
    postId: string;
    userAccountId: string;
    userEvmAddress?: string;
  };
}

export interface TokenOffer extends A2AMessage {
  type: 'token_offer';
  data: {
    postId: string;
    tokenAmount: number;
    hbarPrice: number;
    offerId: string;
    tokenId: string;
    creatorAccountId: string;
  };
}

export interface OfferDenial extends A2AMessage {
  type: 'offer_denial';
  data: {
    postId: string;
    reason: string;
    offerId?: string;
  };
}

export interface PaymentProof extends A2AMessage {
  type: 'payment_proof';
  data: {
    offerId: string;
    transactionId: string;
    userAccountId: string;
    hbarAmount: number;
  };
}

export interface TokenTransferConfirmation extends A2AMessage {
  type: 'token_transfer_confirmation';
  data: {
    offerId: string;
    tokenTransactionId: string;
    tokenAmount: number;
    success: boolean;
  };
}

export interface AgentConfig {
  accountId: string;
  privateKey: string;
  network: 'testnet' | 'mainnet';
  port: number;
  groqApiKey?: string;
}

export interface CreatorProfile {
  id: string;
  hedera_account_id: string;
  display_name: string;
  agent_endpoint_url: string;
  creator_token_id: string;
  token_price_in_hbar: number;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  is_premium: boolean;
}