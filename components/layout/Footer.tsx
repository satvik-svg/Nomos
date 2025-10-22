export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hedera Content Platform
            </h3>
            <p className="text-gray-600">
              Decentralized content monetization platform built on Hedera Hashgraph.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  How it works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Become a Creator
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © 2024 Hedera Content Platform. Built on Hedera Hashgraph.
          </p>
        </div>
      </div>
    </footer>
  );
}