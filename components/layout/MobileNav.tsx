'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

export default function MobileNav() {
  const pathname = usePathname();
  const { isConnected, connectWallet, disconnectWallet, user } = useWallet();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleWalletAction = async () => {
    if (isConnected) {
      setShowMenu(!showMenu);
    } else {
      try {
        await connectWallet();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  return (
    <>
      {/* Backdrop for menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* User Menu */}
      {showMenu && isConnected && (
        <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50 md:hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white truncate">
                  {user?.display_name || 'User'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.hedera_account_id}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                disconnectWallet();
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 text-left text-red-600 dark:text-red-500 font-medium hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
        <div className="flex items-center justify-around px-2 py-3">
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 p-2 ${
            isActive('/') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isActive('/') ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link 
          href="/explore" 
          className={`flex flex-col items-center gap-1 p-2 ${
            isActive('/explore') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-medium">Explore</span>
        </Link>

        <Link 
          href="/creators" 
          className={`flex flex-col items-center gap-1 p-2 ${
            isActive('/creators') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-xs font-medium">Creators</span>
        </Link>

        <Link 
          href="/settings" 
          className={`flex flex-col items-center gap-1 p-2 ${
            isActive('/settings') ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium">Settings</span>
        </Link>

        <button 
          onClick={handleWalletAction}
          className={`flex flex-col items-center gap-1 p-2 ${
            isConnected ? 'text-[#1d9bf0]' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {isConnected ? (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                {user?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium">Account</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs font-medium">Wallet</span>
            </>
          )}
        </button>
      </div>
    </nav>
    </>
  );
}
