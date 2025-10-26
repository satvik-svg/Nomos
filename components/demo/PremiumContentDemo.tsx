'use client';

import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

export default function PremiumContentDemo() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const { showToast } = useToast();

  const simulateUnlockFlow = async () => {
    setIsProcessing(true);

    try {
      // Step 1: Contacting Agent
      setCurrentStep('Contacting CreatorAgent...');
      showToast('Contacting CreatorAgent...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Offer Received
      setCurrentStep('Offer received: 10 tokens for 5 HBAR');
      showToast('Offer received: 10 tokens for 5 HBAR', 'success');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Payment Processing
      setCurrentStep('Processing payment...');
      showToast('Opening HashPack wallet...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Payment Sent
      setCurrentStep('Payment sent! Verifying with CreatorAgent...');
      showToast('Payment sent! Verifying...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 5: Success
      setCurrentStep('Access granted! Received 10 tokens');
      showToast('Access granted! Received 10 tokens', 'success');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsUnlocked(true);
      setCurrentStep('');

    } catch {
      showToast('Unlock failed', 'error');
      setCurrentStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDemo = () => {
    setIsUnlocked(false);
    setIsProcessing(false);
    setCurrentStep('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Post Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              C
            </div>
            <div>
              <div className="font-semibold text-black">Creator</div>
              <div className="text-sm text-gray-500">Premium Content Creator</div>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                🔒 Premium
              </span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-black mb-2">
            Exclusive: Advanced Hedera Development Techniques
          </h2>
          <p className="text-black">
            Learn the latest patterns for building scalable dApps on Hedera with HTS integration...
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {!isUnlocked ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                Premium Content Locked
              </h3>
              <p className="text-black mb-6">
                This content requires 10 access tokens (5 HBAR)
              </p>

              {/* Status Display */}
              {currentStep && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-800 font-medium">
                  {currentStep}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={simulateUnlockFlow}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Unlock with Agents'}
                </button>

                <div className="text-xs text-gray-500">
                  Powered by Hedera Agent Kit & A2A Protocol
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-green-800 font-semibold">Content Unlocked!</div>
                <div className="text-sm text-green-600">You now have access to this premium content</div>
              </div>

              <div className="prose max-w-none text-black">
                <h3 className="text-black">Advanced Hedera Development Techniques</h3>
                <p className="text-black">
                  Welcome to this exclusive content! Here are the advanced techniques for building
                  scalable dApps on Hedera:
                </p>

                <h4 className="text-black">1. HTS Token Integration</h4>
                <p className="text-black">
                  Learn how to efficiently integrate Hedera Token Service (HTS) with your smart contracts
                  using the latest HIP-218 and HIP-376 standards...
                </p>

                <h4 className="text-black">2. Agent-to-Agent Communication</h4>
                <p className="text-black">
                  Implement sophisticated A2A protocols for autonomous agent interactions, enabling
                  complex multi-party negotiations and settlements...
                </p>

                <h4 className="text-black">3. Mirror Node Optimization</h4>
                <p className="text-black">
                  Optimize your queries to Hedera Mirror Nodes for maximum performance and cost
                  efficiency in production applications...
                </p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <strong className="text-black">Pro Tip:</strong> <span className="text-black">Always use the Hedera Agent Kit for production
                    applications to ensure secure and efficient blockchain interactions.</span>
                </div>
              </div>

              <button
                onClick={resetDemo}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}