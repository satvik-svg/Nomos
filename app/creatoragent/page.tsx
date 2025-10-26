import PremiumContentDemo from '@/components/demo/PremiumContentDemo';

export default function CreatorAgentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            CreatorAgent
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI agent that manages premium content access for creators. Handles token offers, 
            payment verification, and autonomous token transfers using Hedera Agent Kit.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              Port 3001
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              HTS Token Management
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Autonomous Transactions
            </span>
          </div>
        </div>

        {/* Premium Content Section */}
        <PremiumContentDemo />
      </div>
    </div>
  );
}