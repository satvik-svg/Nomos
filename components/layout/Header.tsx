'use client';

import Link from 'next/link';
import WalletConnect from '@/components/wallet/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import CreatorBadge from '@/components/creator/CreatorBadge';

export default function Header() {
  const { isConnected, isCreator, user } = useWallet();

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
            <Link href="/explore" className="text-gray-700 hover:text-gray-900">
              Explore
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-gray-900 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </Link>
            <Link href="/creators" className="text-gray-700 hover:text-gray-900">
              Creators
            </Link>
            <Link href="/demo" className="text-blue-600 hover:text-blue-800 font-semibold">
              Agents
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isConnected && isCreator && (
              <div className="hidden md:flex items-center gap-2">
                <CreatorBadge size="sm" />
                {user?.display_name && (
                  <span className="text-sm text-gray-700">{user.display_name}</span>
                )}
              </div>
            )}
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}