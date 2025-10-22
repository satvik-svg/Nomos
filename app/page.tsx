import Sidebar from "@/components/layout/Sidebar";

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Hedera Content Platform
            </h1>
            <p className="text-lg text-gray-600">
              Discover premium content from creators around the world, powered by Hedera Hashgraph.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Getting Started
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Connect Your Wallet</h3>
                  <p className="text-gray-600">Connect your HashPack wallet to get started</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Explore Content</h3>
                  <p className="text-gray-600">Browse free and premium content from creators</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Become a Creator</h3>
                  <p className="text-gray-600">Pay 100 $PLATFORM tokens to start monetizing your content</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500">
              Content feed will be displayed here once wallet integration is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}