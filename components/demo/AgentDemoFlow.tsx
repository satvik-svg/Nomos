'use client';

import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  agent: 'user' | 'echoguard' | 'creator' | 'hedera';
  message?: string;
  duration: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'User Request',
    description: 'User clicks "Unlock Premium Content"',
    agent: 'user',
    message: 'POST /request-access { postId: "premium-post-123", userAccountId: "0.0.7008066" }',
    duration: 1000
  },
  {
    id: 2,
    title: 'EchoGuard → CreatorAgent',
    description: 'EchoGuard sends A2A content inquiry',
    agent: 'echoguard',
    message: 'A2A Message: ContentInquiry → CreatorAgent\n{ type: "content_inquiry", postId: "premium-post-123", userAccountId: "0.0.7008066" }',
    duration: 2000
  },
  {
    id: 3,
    title: 'CreatorAgent Processing',
    description: 'CreatorAgent checks token supply and user balance',
    agent: 'creator',
    message: 'Hedera Agent Kit: Checking token balance for 0.0.7100614\nBalance: 1000 tokens available\nUser has 0 access tokens\nGenerating offer...',
    duration: 2500
  },
  {
    id: 4,
    title: 'CreatorAgent → EchoGuard',
    description: 'CreatorAgent responds with token offer',
    agent: 'creator',
    message: 'A2A Message: TokenOffer → EchoGuard\n{ type: "token_offer", tokenAmount: 10, hbarPrice: 5, offerId: "offer_123", tokenId: "0.0.7100614" }',
    duration: 1500
  },
  {
    id: 5,
    title: 'Offer Display',
    description: 'EchoGuard shows offer to user',
    agent: 'echoguard',
    message: 'Offer received: 10 tokens for 5 HBAR\nDisplaying to user...',
    duration: 1000
  },
  {
    id: 6,
    title: 'User Payment',
    description: 'User approves HBAR payment in HashPack',
    agent: 'user',
    message: 'HashPack Wallet: Transfer 5 HBAR to 0.0.7008065\nTransaction ID: 0.0.7008066@1729879528.123456789',
    duration: 3000
  },
  {
    id: 7,
    title: 'Payment Verification',
    description: 'EchoGuard verifies payment on Hedera',
    agent: 'echoguard',
    message: 'Hedera Agent Kit: Verifying transaction 0.0.7008066@1729879528.123456789\nMirror Node Query: ✅ Payment verified\nSending proof to CreatorAgent...',
    duration: 2000
  },
  {
    id: 8,
    title: 'EchoGuard → CreatorAgent',
    description: 'EchoGuard sends payment proof',
    agent: 'echoguard',
    message: 'A2A Message: PaymentProof → CreatorAgent\n{ type: "payment_proof", offerId: "offer_123", transactionId: "0.0.7008066@1729879528.123456789", hbarAmount: 5 }',
    duration: 1500
  },
  {
    id: 9,
    title: 'Token Transfer',
    description: 'CreatorAgent executes token transfer',
    agent: 'creator',
    message: 'Hedera Agent Kit: Executing token transfer\nTransferring 10 tokens of 0.0.7100614 to 0.0.7008066\nTransaction ID: 0.0.7008065@1729879531.987654321',
    duration: 2500
  },
  {
    id: 10,
    title: 'Confirmation',
    description: 'CreatorAgent confirms successful transfer',
    agent: 'creator',
    message: 'A2A Message: TokenTransferConfirmation → EchoGuard\n{ type: "token_transfer_confirmation", success: true, tokenTransactionId: "0.0.7008065@1729879531.987654321", tokenAmount: 10 }',
    duration: 1500
  },
  {
    id: 11,
    title: 'Access Granted',
    description: 'Content unlocked for user',
    agent: 'echoguard',
    message: '🎉 Access granted! User received 10 tokens\nContent unlocked successfully',
    duration: 1000
  }
];

export default function AgentDemoFlow() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const { showInfo, showSuccess } = useToast();

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'user': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'echoguard': return 'bg-green-100 border-green-300 text-green-800';
      case 'creator': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'hedera': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'user': return '👤';
      case 'echoguard': return '🛡️';
      case 'creator': return '📡';
      case 'hedera': return '⚡';
      default: return '🤖';
    }
  };

  const startDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setLogs([]);
    
    showInfo('Starting Agent Flow...');

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      const step = DEMO_STEPS[i];
      setCurrentStep(i);
      
      // Add log entry
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${step.agent.toUpperCase()}: ${step.title}`;
      setLogs(prev => [...prev, logEntry]);
      
      if (step.message) {
        const messageEntry = `[${timestamp}] ${step.message}`;
        setLogs(prev => [...prev, messageEntry]);
      }

      // Show toast for important steps
      if ([1, 4, 6, 9, 11].includes(step.id)) {
        showInfo(step.title);
      }

      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      setCompletedSteps(prev => [...prev, i]);
    }

    setCurrentStep(-1);
    setIsRunning(false);
    showSuccess('Agent Flow Completed!');
  };

  const resetDemo = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setLogs([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Agent Communication Flow
        </h1>
        <p className="text-gray-600">
          Complete Agent-to-Agent communication flow for premium content access
        </p>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={startDemo}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running...' : 'Start Flow'}
          </button>
          
          <button
            onClick={resetDemo}
            disabled={isRunning}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flow Visualization */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Agent Flow Steps</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {DEMO_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  currentStep === index
                    ? `${getAgentColor(step.agent)} ring-2 ring-offset-2 ring-blue-500 scale-105`
                    : completedSteps.includes(index)
                    ? `${getAgentColor(step.agent)} opacity-75`
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {completedSteps.includes(index) ? '✅' : getAgentIcon(step.agent)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {step.id}. {step.title}
                    </div>
                    <div className="text-sm opacity-75">
                      {step.description}
                    </div>
                  </div>
                  {currentStep === index && (
                    <div className="animate-spin text-blue-600">⚡</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Logs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Live Agent Logs</h2>
          
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            <div className="text-green-300 mb-2">
              === Nomos Agent Communication Log ===
            </div>
            {logs.length === 0 ? (
              <div className="text-gray-500">
                Waiting for demo to start...
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.includes('A2A Message') ? 'text-yellow-400' :
                    log.includes('Hedera Agent Kit') ? 'text-blue-400' :
                    log.includes('✅') ? 'text-green-400' :
                    'text-green-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
            {isRunning && (
              <div className="animate-pulse text-yellow-400">
                ▶ Processing...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="font-semibold text-blue-800">User</div>
          <div className="text-sm text-blue-600">Frontend Interface</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="font-semibold text-green-800">EchoGuard</div>
          <div className="text-sm text-green-600">Port 3002</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="font-semibold text-purple-800">CreatorAgent</div>
          <div className="text-sm text-purple-600">Port 3001</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="font-semibold text-orange-800">Hedera Network</div>
          <div className="text-sm text-orange-600">Testnet</div>
        </div>
      </div>


    </div>
  );
}