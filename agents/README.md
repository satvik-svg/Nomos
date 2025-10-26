# Nomos Agents - Hedera Agent Kit Integration

This directory contains the AI agents that power Nomos's decentralized content access system using the Hedera Agent Kit and A2A (Agent-to-Agent) communication protocol.

## Architecture

### CreatorAgent (`creator-agent/`)
- **Purpose**: Manages premium content access for creators
- **Responsibilities**:
  - Receives A2A content access inquiries
  - Verifies user token balances and payment capabilities
  - Creates dynamic token offers based on creator pricing
  - Executes secure token transfers after payment verification
  - Maintains creator treasury and token supply

### EchoGuardAgent (`echoguard-agent/`)
- **Purpose**: Personal AI assistant for users accessing premium content
- **Responsibilities**:
  - Negotiates with CreatorAgents on behalf of users
  - Coordinates payment transactions and verification
  - Protects user interests in all transactions
  - Bridges frontend requests to the agent network

## A2A Communication Protocol

The agents communicate using standardized message types:

```typescript
// Content access request
ContentInquiry -> CreatorAgent
TokenOffer | OfferDenial <- CreatorAgent

// Payment processing
PaymentProof -> CreatorAgent
TokenTransferConfirmation <- CreatorAgent
```

## Setup & Installation

### 1. Install Dependencies
```bash
cd agents
npm install
```

### 2. Environment Configuration
Ensure your `.env.local` contains:
```bash
# Hedera Configuration
ACCOUNT_ID=0.0.xxxxx
HEX_Encoded_Private_Key=0x...
HEDERA_NETWORK=testnet

# AI Provider
GROQ_API_KEY=your_groq_api_key_here

# Agent Ports
AGENT_PORT_CREATOR=3001
AGENT_PORT_ECHOGUARD=3002

# Supabase (for EchoGuard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Get Groq API Key
1. Visit [console.groq.com](https://console.groq.com)
2. Create a free account
3. Generate an API key
4. Add it to your `.env.local` file

## Running the Agents

### Development Mode (with hot reload)
```bash
# Start both agents in development mode
npm run dev:both

# Or start individually
npm run dev:creator    # CreatorAgent on port 3001
npm run dev:echoguard  # EchoGuardAgent on port 3002
```

### Production Mode
```bash
# Build TypeScript
npm run build

# Start both agents
npm run start:both

# Or start individually
npm run start:creator
npm run start:echoguard
```

### From Main Project
```bash
# Install agent dependencies
npm run agents:install

# Start agents in development
npm run agents:dev

# Start full stack (frontend + agents)
npm run dev:full
```

## Agent Endpoints

### CreatorAgent (Port 3001)
- `GET /health` - Health check
- `POST /a2a/inquiry` - Handle content access inquiries
- `POST /a2a/payment-proof` - Process payment proofs
- `POST /setup` - Configure creator profile

### EchoGuardAgent (Port 3002)
- `GET /health` - Health check
- `POST /request-access` - Request content access (called by frontend)
- `POST /submit-payment` - Submit payment proof (called by frontend)
- `GET /negotiation/:id` - Get negotiation status

## Integration with Frontend

The frontend integrates with agents through:

1. **Agent Integration Service** (`/lib/agent-integration.ts`)
   - Handles HTTP communication with EchoGuard agent
   - Provides typed interfaces for requests/responses

2. **React Hook** (`/lib/hooks/useAgentIntegration.ts`)
   - Manages agent negotiation state
   - Provides easy-to-use functions for components

3. **UI Component** (`/components/posts/AgentUnlockButton.tsx`)
   - Complete unlock flow with agent communication
   - Real-time status updates and user feedback

## Demo Flow

1. **User clicks "Unlock Premium Content"**
   - Frontend calls EchoGuard agent
   - EchoGuard queries Supabase for creator info

2. **Agent-to-Agent Negotiation**
   - EchoGuard sends A2A inquiry to CreatorAgent
   - CreatorAgent checks token supply and user balance
   - CreatorAgent responds with token offer or denial

3. **Payment Processing**
   - User approves HBAR payment in HashPack wallet
   - Frontend submits transaction ID to EchoGuard
   - EchoGuard verifies payment and forwards proof to CreatorAgent

4. **Token Transfer**
   - CreatorAgent verifies payment via Hedera Mirror Node
   - CreatorAgent executes token transfer using Hedera Agent Kit
   - Content access is granted to user

## Hedera Agent Kit Features Used

- **Core Queries Plugin**: Account and token balance queries
- **Core Account Plugin**: HBAR transfers and account operations
- **Core Token Plugin**: HTS token creation and transfers
- **Autonomous Mode**: Agents execute transactions automatically
- **LangChain Integration**: Natural language processing for agent decisions

## Security Considerations

- Private keys stored securely in environment variables
- Payment verification through cryptographic transaction IDs
- Agent endpoints use CORS protection
- Input validation on all A2A messages
- Rate limiting to prevent abuse

## Troubleshooting

### Common Issues

1. **"No AI provider configured"**
   - Ensure GROQ_API_KEY is set in `.env.local`
   - Verify Groq API key is valid

2. **"Failed to connect to Hedera"**
   - Check ACCOUNT_ID and HEX_Encoded_Private_Key
   - Ensure account has sufficient HBAR for transactions

3. **"CreatorAgent not responding"**
   - Verify CreatorAgent is running on port 3001
   - Check creator profile is configured in Supabase

4. **"Token transfer failed"**
   - Ensure creator has sufficient token supply
   - Verify token association for user account

### Debug Mode
Set `DEBUG=true` in environment for verbose logging:
```bash
DEBUG=true npm run dev:both
```

## Contributing

When adding new agent functionality:

1. Update message types in `shared/types.ts`
2. Add corresponding handlers in both agents
3. Update integration service and React hooks
4. Test the complete A2A flow
5. Update this documentation

## License

MIT License - see main project LICENSE file.