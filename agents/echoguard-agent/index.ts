import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Client, PrivateKey, AccountId, TransferTransaction, Hbar } from '@hashgraph/sdk';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { 
  HederaLangchainToolkit, 
  AgentMode, 
  coreQueriesPlugin, 
  coreAccountPlugin 
} from 'hedera-agent-kit';
import { createClient } from '@supabase/supabase-js';
import { 
  ContentInquiry, 
  TokenOffer, 
  OfferDenial, 
  PaymentProof, 
  TokenTransferConfirmation,
  AgentConfig,
  CreatorProfile,
  Post 
} from '../shared/types.js';
import { 
  createHederaClient, 
  createA2AMessage, 
  convertHbarToTinybar,
  logWithTimestamp 
} from '../shared/utils.js';

dotenv.config();

class EchoGuardAgent {
  private app: express.Application;
  private client: Client;
  private agentExecutor!: AgentExecutor;
  private config: AgentConfig;
  private supabase: any;
  private activeNegotiations: Map<string, unknown> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    this.app = express();
    this.client = createHederaClient(config.accountId, config.privateKey, config.network);
    
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Request logging
    this.app.use((req, res, next) => {
      logWithTimestamp(`${req.method} ${req.path}`, req.body);
      next();
    });
  }

  private async initializeAgent(): Promise<void> {
    if (!this.config.groqApiKey) {
      throw new Error('GROQ_API_KEY is required for EchoGuardAgent');
    }

    const llm = new ChatGroq({
      apiKey: this.config.groqApiKey,
      model: 'llama-3.3-70b-versatile'
    });

    const hederaAgentToolkit = new HederaLangchainToolkit({
      client: this.client,
      configuration: {
        tools: [],
        context: {
          mode: AgentMode.AUTONOMOUS,
        },
        plugins: [
          coreQueriesPlugin,
          coreAccountPlugin,
        ],
      },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are an EchoGuardAgent, a personal AI assistant that helps users access premium content securely. 
       Your role is to:
       1. Negotiate with CreatorAgents on behalf of users
       2. Verify payment transactions and token transfers
       3. Coordinate secure content access
       4. Protect user interests in all transactions
       
       Always prioritize user security and fair pricing.`],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    const tools = hederaAgentToolkit.getTools();
    const agent = createToolCallingAgent({ llm, tools, prompt });
    
    this.agentExecutor = new AgentExecutor({ agent, tools });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        agent: 'EchoGuardAgent',
        accountId: this.config.accountId,
        timestamp: new Date().toISOString()
      });
    });

    // Request content access (called by frontend)
    this.app.post('/request-access', async (req, res) => {
      try {
        const { postId, userAccountId, userEvmAddress } = req.body;
        logWithTimestamp('Content access request', { postId, userAccountId });

        const result = await this.requestContentAccess(postId, userAccountId, userEvmAddress);
        res.json(result);
      } catch (error) {
        logWithTimestamp('Error in request-access', error);
        res.status(500).json({ error: 'Failed to request access' });
      }
    });

    // Submit payment proof (called by frontend after user pays)
    this.app.post('/submit-payment', async (req, res) => {
      try {
        const { negotiationId, transactionId, hbarAmount } = req.body;
        logWithTimestamp('Payment submission', { negotiationId, transactionId });

        const result = await this.submitPaymentProof(negotiationId, transactionId, hbarAmount);
        res.json(result);
      } catch (error) {
        logWithTimestamp('Error in submit-payment', error);
        res.status(500).json({ error: 'Failed to submit payment' });
      }
    });

    // Get negotiation status
    this.app.get('/negotiation/:id', (req, res) => {
      const negotiation = this.activeNegotiations.get(req.params.id);
      if (negotiation) {
        res.json(negotiation);
      } else {
        res.status(404).json({ error: 'Negotiation not found' });
      }
    });
  }

  private async requestContentAccess(postId: string, userAccountId: string, userEvmAddress?: string) {
    try {
      // 1. Get post details from Supabase
      const { data: post, error: postError } = await this.supabase
        .from('posts')
        .select('*, users!inner(*)')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        throw new Error('Post not found');
      }

      if (!post.is_premium) {
        return { 
          success: true, 
          message: 'Content is public, no payment required',
          accessGranted: true 
        };
      }

      // 2. Get creator profile
      const creator: CreatorProfile = post.users;
      
      if (!creator.agent_endpoint_url) {
        throw new Error('Creator agent not available');
      }

      // 3. Create negotiation record
      const negotiationId = `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 4. Send A2A inquiry to CreatorAgent
      const inquiry: ContentInquiry = createA2AMessage<ContentInquiry>(
        'content_inquiry',
        this.config.accountId,
        creator.hedera_account_id,
        {
          postId,
          userAccountId,
          userEvmAddress
        }
      );

      logWithTimestamp('Sending inquiry to CreatorAgent', { 
        endpoint: creator.agent_endpoint_url,
        inquiry 
      });

      const response = await fetch(`${creator.agent_endpoint_url}/a2a/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry)
      });

      if (!response.ok) {
        throw new Error(`CreatorAgent responded with ${response.status}`);
      }

      const agentResponse: TokenOffer | OfferDenial = await response.json();

      // 5. Store negotiation state
      const negotiation = {
        id: negotiationId,
        postId,
        userAccountId,
        creatorAccountId: creator.hedera_account_id,
        creatorEndpoint: creator.agent_endpoint_url,
        status: agentResponse.type === 'token_offer' ? 'offer_received' : 'denied',
        offer: agentResponse.type === 'token_offer' ? agentResponse : null,
        denial: agentResponse.type === 'offer_denial' ? agentResponse : null,
        createdAt: Date.now()
      };

      this.activeNegotiations.set(negotiationId, negotiation);

      logWithTimestamp('Negotiation created', negotiation);

      return {
        success: true,
        negotiationId,
        status: negotiation.status,
        offer: negotiation.offer,
        denial: negotiation.denial
      };

    } catch (error) {
      logWithTimestamp('Error in requestContentAccess', error);
      throw error;
    }
  }

  private async submitPaymentProof(negotiationId: string, transactionId: string, hbarAmount: number) {
    try {
      const negotiation = this.activeNegotiations.get(negotiationId) as any;
      
      if (!negotiation) {
        throw new Error('Negotiation not found');
      }

      if (negotiation.status !== 'offer_received') {
        throw new Error('Invalid negotiation status');
      }

      // 1. Verify payment using Hedera Agent Kit
      const verificationQuery = await this.agentExecutor.invoke({
        input: `Verify that transaction ${transactionId} shows a payment of ${hbarAmount} HBAR from ${negotiation.userAccountId} to ${negotiation.creatorAccountId}`
      });

      const paymentVerified = verificationQuery.output.includes('verified') || 
                            verificationQuery.output.includes('success') ||
                            verificationQuery.output.includes('confirmed');

      if (!paymentVerified) {
        negotiation.status = 'payment_failed';
        negotiation.error = 'Payment verification failed';
        return { success: false, error: 'Payment verification failed' };
      }

      // 2. Send payment proof to CreatorAgent
      const paymentProof: PaymentProof = createA2AMessage<PaymentProof>(
        'payment_proof',
        this.config.accountId,
        negotiation.creatorAccountId,
        {
          offerId: negotiation.offer.data.offerId,
          transactionId,
          userAccountId: negotiation.userAccountId,
          hbarAmount
        }
      );

      logWithTimestamp('Sending payment proof to CreatorAgent', paymentProof);

      const response = await fetch(`${negotiation.creatorEndpoint}/a2a/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentProof)
      });

      if (!response.ok) {
        throw new Error(`CreatorAgent responded with ${response.status}`);
      }

      const confirmation: TokenTransferConfirmation = await response.json();

      // 3. Update negotiation status
      negotiation.status = confirmation.data.success ? 'completed' : 'token_transfer_failed';
      negotiation.confirmation = confirmation;
      negotiation.completedAt = Date.now();

      logWithTimestamp('Payment processing completed', {
        negotiationId,
        success: confirmation.data.success,
        tokenTransactionId: confirmation.data.tokenTransactionId
      });

      return {
        success: confirmation.data.success,
        tokenTransactionId: confirmation.data.tokenTransactionId,
        tokenAmount: confirmation.data.tokenAmount,
        accessGranted: confirmation.data.success
      };

    } catch (error) {
      logWithTimestamp('Error in submitPaymentProof', error);
      
      // Update negotiation with error
      const negotiation = this.activeNegotiations.get(negotiationId) as any;
      if (negotiation) {
        negotiation.status = 'error';
        negotiation.error = error instanceof Error ? error.message : 'Unknown error';
      }
      
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initializeAgent();
      
      this.app.listen(this.config.port, () => {
        logWithTimestamp(`EchoGuardAgent started on port ${this.config.port}`);
        logWithTimestamp(`Account ID: ${this.config.accountId}`);
        logWithTimestamp(`Network: ${this.config.network}`);
      });
    } catch (error) {
      logWithTimestamp('Failed to start EchoGuardAgent', error);
      process.exit(1);
    }
  }
}

// Start the agent if this file is run directly
const config: AgentConfig = {
  accountId: process.env.ACCOUNT_ID!,
  privateKey: process.env.HEX_Encoded_Private_Key!,
  network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  port: parseInt(process.env.AGENT_PORT_ECHOGUARD || '3002'),
  groqApiKey: process.env.GROQ_API_KEY
};

console.log('🛡️ Starting EchoGuardAgent with config:', {
  accountId: config.accountId,
  network: config.network,
  port: config.port,
  hasGroqKey: !!config.groqApiKey
});

const agent = new EchoGuardAgent(config);
agent.start().catch(console.error);

export default EchoGuardAgent;