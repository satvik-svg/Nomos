'use client';

/**
 * Creator Settings Page
 * Allows creators to manage their content pricing and preferences
 * 
 * Requirements: 10.2, 10.4
 */

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import CreatorBadge from '@/components/creator/CreatorBadge';
import { UserService } from '@/lib/supabase';

export default function CreatorSettingsPage() {
  const { isConnected, isCreator, user } = useWallet();
  const router = useRouter();
  const [defaultPrice, setDefaultPrice] = useState<string>('10');
  const [agentEndpoint, setAgentEndpoint] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not a creator
  useEffect(() => {
    if (isConnected && !isCreator) {
      router.push('/settings');
    }
  }, [isConnected, isCreator, router]);

  // Load current settings
  useEffect(() => {
    if (user) {
      setDefaultPrice(user.content_price_in_platform_token?.toString() || '10');
      setAgentEndpoint(user.agent_endpoint_url || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const priceValue = parseFloat(defaultPrice);
      if (isNaN(priceValue) || priceValue < 0) {
        throw new Error('Please enter a valid price');
      }

      await UserService.updateUser(user.id, {
        content_price_in_platform_token: priceValue,
        agent_endpoint_url: agentEndpoint.trim() || undefined,
      });

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save settings' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600">Please connect your wallet to access creator settings.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Creator Settings
              </h1>
              <CreatorBadge size="md" />
            </div>
            <p className="text-lg text-gray-600">
              Manage your creator preferences and default content pricing.
            </p>
          </div>

          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Default Content Price */}
            <div>
              <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Default Content Price
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="defaultPrice"
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <span className="text-gray-600 font-medium">$PLATFORM</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This will be the default price for your premium content. You can override this for individual posts.
              </p>
            </div>

            {/* Agent Endpoint URL */}
            <div>
              <label htmlFor="agentEndpoint" className="block text-sm font-medium text-gray-700 mb-2">
                Agent Endpoint URL (Optional)
              </label>
              <input
                type="url"
                id="agentEndpoint"
                value={agentEndpoint}
                onChange={(e) => setAgentEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-agent-endpoint.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                Optional URL for AI agent integration or custom content delivery.
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Creator Stats */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Creator Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Account ID</span>
                <span className="font-mono text-sm text-gray-900">{user?.hedera_account_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Creator Status</span>
                <CreatorBadge size="sm" />
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Registration Fee Paid</span>
                <span className="text-green-600 font-medium">100 $PLATFORM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
