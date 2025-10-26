import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Client, PrivateKey, AccountId, TokenId, TransferTransaction, Hbar } from '@hashgraph/sdk';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { 
  HederaLangchainToolkit, 
  AgentMode, 
  coreQueriesPlugin, 
  coreAccountPlugin, 
  coreTokenPlugin 
} from 'hedera-agent-kit';
import { 
  ContentInquiry, 
  TokenOffer, 
  OfferDenial, 
  PaymentProof, 
  TokenTransferConfirmation,
  AgentConfig,
  CreatorProfile 
} from '../shared/types.js';
import { 
  createHederaClient, 
  createA2AMessage, 
  generateOfferId, 
  convertHbarToTinybar,
  logWithTimestamp 
} from '../shared/utils.js';

dotenv.config();

class CreatorAgent {
  private app: express.Application;
  private client: Client;
  private agentExecutor!: AgentExecutor;
  private config: AgentConfig;
  private creatorProfile: CreatorProfile | null = null;
  private pendingOffers: Map<string, unknown> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    this.app = express();
    this.client = createHederaClient(config.accountId, config.privateKey, config.network);
    
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
      throw new Error('GROQ_API_KEY is required for CreatorAgent');
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
          coreTokenPlugin,
        ],
      },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are a CreatorAgent managing premium content access for a creator on Hedera. 
       Your role is to:
       1. Verify user token balances and payment capabilities
       2. Calculate fair token prices based on creator settings
       3. Execute secure token transfers after payment verification
       4. Maintain creator treasury and token supply
       
       Always prioritize security and accurate financial calculations.`],
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
        agent: 'CreatorAgent',
        accountId: this.config.accountId,
        timestamp: new Date().toISOString()
      });
    });

    // A2A Content Inquiry Handler
    this.app.post('/a2a/inquiry', async (req, res) => {
      try {
        const inquiry: ContentInquiry = req.body;
        logWithTimestamp('Received content inquiry', inquiry);

        const response = await this.handleContentInquiry(inquiry);
        res.json(response);
      } catch (error) {
        logWithTimestamp('Error handling inquiry', error);
        res.status(500).json({ error: 'Failed to process inquiry' });
      }
    });

    // A2A Payment Proof Handler
    this.app.post('/a2a/payment-proof', async (req, res) => {
      try {
        const proof: PaymentProof = req.body;
        logWithTimestamp('Received payment proof', proof);

        const response = await this.handlePaymentProof(proof);
        res.json(response);
      } catch (error) {
        logWithTimestamp('Error handling payment proof', error);
        res.status(500).json({ error: 'Failed to process payment proof' });
      }
    });

    // Creator profile setup
    this.app.post('/setup', async (req, res) => {
      try {
        this.creatorProfile = req.body;
        logWithTimestamp('Creator profile updated', this.creatorProfile);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
      }
    });
  }

  private async handleContentInquiry(inquiry: ContentInquiry): Promise<TokenOffer | OfferDenial> {
    try {
      // Check if we have creator profile
      if (!this.creatorProfile) {
        return createA2AMessage<OfferDenial>(
          'offer_denial',
          this.config.accountId,
          inquiry.from,
          {
            postId: inquiry.data.postId,
            reason: 'Creator profile not configured'
          }
        );
      }

      // Check our token balance using Hedera Agent Kit
      const balanceQuery = await this.agentExecutor.invoke({
        input: `Check my token balance for token ${this.creatorProfile.creator_token_id}`
      });

      // Parse the balance from agent response (simplified for demo)
      const hasTokens = balanceQuery.output.includes('balance') && !balanceQuery.output.includes('0');

      if (!hasTokens) {
        return createA2AMessage<OfferDenial>(
          'offer_denial',
          this.config.accountId,
          inquiry.from,
          {
            postId: inquiry.data.postId,
            reason: 'Insufficient token supply'
          }
        );
      }

      // Check if user already has access tokens
      if (inquiry.data.userEvmAddress) {
        const userBalanceQuery = await this.agentExecutor.invoke({
          input: `Check token balance for account ${inquiry.data.userAccountId} for token ${this.creatorProfile.creator_token_id}`
        });

        if (userBalanceQuery.output.includes('balance') && !userBalanceQuery.output.includes('0')) {
          return createA2AMessage<OfferDenial>(
            'offer_denial',
            this.config.accountId,
            inquiry.from,
            {
              postId: inquiry.data.postId,
              reason: 'User already has access tokens'
            }
          );
        }
      }

      // Create token offer
      const offerId = generateOfferId();
      const tokenAmount = 10; // Standard access tokens
      const hbarPrice = this.creatorProfile.token_price_in_hbar;

      const offer: TokenOffer = createA2AMessage<TokenOffer>(
        'token_offer',
        this.config.accountId,
        inquiry.from,
        {
          postId: inquiry.data.postId,
          tokenAmount,
          hbarPrice,
          offerId,
          tokenId: this.creatorProfile.creator_token_id,
          creatorAccountId: this.config.accountId
        }
      );

      // Store pending offer
      this.pendingOffers.set(offerId, {
        ...offer,
        userAccountId: inquiry.data.userAccountId,
        createdAt: Date.now()
      });

      logWithTimestamp('Created token offer', offer);
      return offer;

    } catch (error) {
      logWithTimestamp('Error in handleContentInquiry', error);
      return createA2AMessage<OfferDenial>(
        'offer_denial',
        this.config.accountId,
        inquiry.from,
        {
          postId: inquiry.data.postId,
          reason: 'Internal agent error'
        }
      );
    }
  }

  private async handlePaymentProof(proof: PaymentProof): Promise<TokenTransferConfirmation> {
    try {
      const pendingOffer = this.pendingOffers.get(proof.data.offerId) as any;
      
      if (!pendingOffer) {
        throw new Error('Offer not found or expired');
      }

      // Verify payment using Hedera Agent Kit
      const verificationQuery = await this.agentExecutor.invoke({
        input: `Verify transaction ${proof.data.transactionId} shows payment of ${proof.data.hbarAmount} HBAR from account ${proof.data.userAccountId} to account ${this.config.accountId}`
      });

      // Simplified verification check (in production, use proper mirror node queries)
      const paymentVerified = verificationQuery.output.includes('verified') || verificationQuery.output.includes('success');

      if (!paymentVerified) {
        throw new Error('Payment verification failed');
      }

      // Execute token transfer using Hedera Agent Kit
      const transferQuery = await this.agentExecutor.invoke({
        input: `Transfer ${pendingOffer.data.tokenAmount} tokens of ${pendingOffer.data.tokenId} to account ${proof.data.userAccountId}`
      });

      const transferSuccess = transferQuery.output.includes('success') || transferQuery.output.includes('transferred');

      // Clean up pending offer
      this.pendingOffers.delete(proof.data.offerId);

      const confirmation: TokenTransferConfirmation = createA2AMessage<TokenTransferConfirmation>(
        'token_transfer_confirmation',
        this.config.accountId,
        proof.from,
        {
          offerId: proof.data.offerId,
          tokenTransactionId: transferQuery.output.match(/0\.0\.\d+@[\d.]+/)?.[0] || 'unknown',
          tokenAmount: pendingOffer.data.tokenAmount,
          success: transferSuccess
        }
      );

      logWithTimestamp('Token transfer completed', confirmation);
      return confirmation;

    } catch (error) {
      logWithTimestamp('Error in handlePaymentProof', error);
      
      return createA2AMessage<TokenTransferConfirmation>(
        'token_transfer_confirmation',
        this.config.accountId,
        proof.from,
        {
          offerId: proof.data.offerId,
          tokenTransactionId: '',
          tokenAmount: 0,
          success: false
        }
      );
    }
  }

  public async start(): Promise<void> {
    try {
      await this.initializeAgent();
      
      this.app.listen(this.config.port, () => {
        logWithTimestamp(`CreatorAgent started on port ${this.config.port}`);
        logWithTimestamp(`Account ID: ${this.config.accountId}`);
        logWithTimestamp(`Network: ${this.config.network}`);
      });
    } catch (error) {
      logWithTimestamp('Failed to start CreatorAgent', error);
      process.exit(1);
    }
  }
}

// Start the agent if this file is run directly
const config: AgentConfig = {
  accountId: process.env.ACCOUNT_ID!,
  privateKey: process.env.HEX_Encoded_Private_Key!,
  network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet',
  port: parseInt(process.env.AGENT_PORT_CREATOR || '3001'),
  groqApiKey: process.env.GROQ_API_KEY
};

console.log('🚀 Starting CreatorAgent with config:', {
  accountId: config.accountId,
  network: config.network,
  port: config.port,
  hasGroqKey: !!config.groqApiKey
});

const agent = new CreatorAgent(config);
agent.start().catch(console.error);

export default CreatorAgent;