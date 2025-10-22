'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';

export default function Sidebar() {
  const { isCreator, isConnected } = useWallet();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <nav className="p-4">
        <div className="space-y-2">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Home Feed
          </Link>
          
          <Link
            href="/explore"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/explore') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Explore
          </Link>
          
          <Link
            href="/creators"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/creators') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Creators
          </Link>
        </div>

        {isConnected && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account
            </h3>
            <div className="mt-2 space-y-2">
              <Link
                href="/settings"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/settings') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Settings
              </Link>
            </div>
          </div>
        )}

        {isCreator && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Creator Tools
            </h3>
            <div className="mt-2 space-y-2">
              <Link
                href="/create"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/create') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Create Post
              </Link>
              
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              
              <Link
                href="/analytics"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/analytics') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Analytics
              </Link>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}