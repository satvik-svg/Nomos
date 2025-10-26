import AgentDemoFlow from '@/components/demo/AgentDemoFlow';

export default function EchoGuardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            EchoGuard Agent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personal AI agent that negotiates with CreatorAgents on behalf of users. 
            Handles A2A communication, payment coordination, and user protection.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Port 3002
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              A2A Negotiation
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              User Protection
            </span>
          </div>
        </div>

        {/* Agent Flow Visualization */}
        <AgentDemoFlow />
      </div>
    </div>
  );
}