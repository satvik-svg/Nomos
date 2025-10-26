import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Hedera Agent Kit Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A2A (Agent-to-Agent) communication system using Hedera Agent Kit. 
            Two specialized agents work together to enable secure premium content access.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Multi-Agent System
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Hedera Network
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              A2A Protocol
            </span>
          </div>
        </div>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* CreatorAgent Card */}
          <Link href="/creatoragent" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-transparent group-hover:border-purple-200">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">CreatorAgent</h2>
                <p className="text-gray-600">
                  Manages premium content access for creators. Handles token offers, 
                  payment verification, and autonomous HTS token transfers.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-center gap-2 text-sm">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Port 3001</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">HTS Tokens</span>
                  </div>
                  <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                    View CreatorAgent →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* EchoGuard Card */}
          <Link href="/echoguard" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-2 border-transparent group-hover:border-green-200">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">EchoGuard Agent</h2>
                <p className="text-gray-600">
                  Personal AI agent that negotiates with CreatorAgents on behalf of users. 
                  Handles A2A communication and protects user interests.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-center gap-2 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Port 3002</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">A2A Protocol</span>
                  </div>
                  <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                    View EchoGuard →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Technical Overview */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Technical Architecture
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">A2A Communication</h3>
              <p className="text-gray-600 text-sm">
                Standardized message protocol for agent-to-agent negotiation with 
                content inquiries, token offers, and payment confirmations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hedera Integration</h3>
              <p className="text-gray-600 text-sm">
                Full Hedera Agent Kit integration with core plugins for queries, 
                accounts, and HTS token operations with autonomous execution.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Transactions</h3>
              <p className="text-gray-600 text-sm">
                Cryptographic verification of all payments via Hedera Mirror Node 
                with 3-5 second finality for instant content access.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Explore the Agents
          </h2>
          <p className="text-gray-600">
            Click on each agent above to see detailed capabilities and live interactions
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/creatoragent"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              CreatorAgent
            </Link>
            <Link 
              href="/echoguard"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              EchoGuard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}