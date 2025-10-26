'use client';

import React, { useState, useEffect } from 'react';

export default function HashPackDebug() {
  const [debugInfo, setDebugInfo] = useState<{
    hasHashPack: boolean;
    hasHashConnect: boolean;
    hasWalletConnect: boolean;
    userAgent: string;
    windowKeys: string[];
    projectId: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for wallet APIs
      const hasHashPack = !!(window as any).hashpack;
      const hasHashConnect = !!(window as any).hashconnect;
      const hasWalletConnect = !!(window as any).WalletConnect;
      
      // Get all window properties that might be related to wallets
      const windowKeys = Object.keys(window as any).filter((key: string) => 
        key.toLowerCase().includes('hash') || 
        key.toLowerCase().includes('pack') ||
        key.toLowerCase().includes('connect') ||
        key.toLowerCase().includes('wallet')
      );

      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'Not set';

      setDebugInfo({
        hasHashPack,
        hasHashConnect,
        hasWalletConnect,
        userAgent: navigator.userAgent,
        windowKeys,
        projectId
      });
    }
  }, []);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-sm font-mono">
      <h3 className="font-bold mb-2">HashPack Debug Info</h3>
      <div className="space-y-1">
        <div>HashPack API: {debugInfo.hasHashPack ? '✅ Found' : '❌ Not found'}</div>
        <div>HashConnect API: {debugInfo.hasHashConnect ? '✅ Found' : '❌ Not found'}</div>
        <div>WalletConnect: {debugInfo.hasWalletConnect ? '✅ Found' : '❌ Not found'}</div>
        <div>Project ID: {debugInfo.projectId}</div>
        <div>Browser: {debugInfo.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}</div>
        {debugInfo.windowKeys.length > 0 && (
          <div>
            <div>Related window properties:</div>
            <ul className="ml-4">
              {debugInfo.windowKeys.map(key => (
                <li key={key}>• {key}</li>
              ))}
            </ul>
          </div>
        )}
        {debugInfo.windowKeys.length === 0 && (
          <div className="text-red-600">No HashPack-related properties found on window object</div>
        )}
      </div>
      
      <div className="mt-4 p-2 bg-yellow-100 rounded">
        <strong>Troubleshooting:</strong>
        <ul className="mt-1 text-xs">
          <li>1. Make sure HashPack extension is installed</li>
          <li>2. Make sure HashPack extension is enabled</li>
          <li>3. Try refreshing the page</li>
          <li>4. Check if HashPack is unlocked</li>
          <li>5. Verify WalletConnect project ID is set</li>
          <li>6. Check browser console for errors</li>
        </ul>
      </div>
    </div>
  );
}