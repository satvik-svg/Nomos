'use client';

import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';
import HashPackDebug from '@/components/debug/HashPackDebug';

export default function WalletConnect() {
  const { 
    isConnected, 
    accountId, 
    user, 
    isLoading, 
    error, 
    connectWallet, 
    disconnectWallet,
    clearError 
  } = useWallet();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleConnect = async () => {
    clearError();
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
      // Error is already handled by the wallet context
    }
  };

  const handleDisconnect = async () => {
    clearError();
    await disconnectWallet();
    setShowDropdown(false);
  };

  if (isLoading) {
    return (
      <button 
        disabled 
        className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
      >
        Connecting...
      </button>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          className="bg-white text-black px-4 py-2 rounded-md transition-colors"
        >
          Connect Wallet
        </button>
        
        {error && (
          <div className="absolute top-full mt-2 right-0 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm max-w-sm z-20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">{error.userMessage}</div>
                {error.recoveryAction && (
                  <div className="mt-1 text-xs text-red-600">{error.recoveryAction}</div>
                )}
                {error.technicalDetails && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowDebug(!showDebug)}
                      className="text-xs text-red-600 underline hover:text-red-800"
                    >
                      {showDebug ? 'Hide' : 'Show'} Technical Details
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={clearError}
                className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
              >
                ×
              </button>
            </div>
            {showDebug && error.technicalDetails && (
              <div className="mt-2 border-t border-red-300 pt-2">
                <div className="text-xs font-mono text-red-800 break-all">
                  {error.technicalDetails}
                </div>
                <div className="mt-2">
                  <HashPackDebug />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
      >
        <div className="w-2 h-2 bg-green-300 rounded-full"></div>
        <span>
          {user?.display_name || `${accountId?.slice(0, 8)}...${accountId?.slice(-4)}`}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-48 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user?.display_name || 'Connected'}
            </p>
            <p className="text-xs text-gray-500">
              {accountId}
            </p>
          </div>
          
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500">
              Status: {user ? 'User' : 'Loading...'}
            </p>
          </div>
          
          <div className="border-t border-gray-100">
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm max-w-xs z-20">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium">{error.userMessage}</div>
              {error.recoveryAction && (
                <div className="mt-1 text-xs text-red-600">{error.recoveryAction}</div>
              )}
            </div>
            <button 
              onClick={clearError}
              className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}