'use client';

import Link from 'next/link';
import WalletConnect from '@/components/wallet/WalletConnect';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Hedera Content Platform
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/creators" className="text-gray-700 hover:text-gray-900">
              Creators
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}