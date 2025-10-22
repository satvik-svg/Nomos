'use client';

import Sidebar from "@/components/layout/Sidebar";
import { useWallet } from '@/contexts/WalletContext';
import UserProfile from '@/components/user/UserProfile';
import CreatorRegistrationButton from '@/components/creator/CreatorRegistrationButton';

export default function SettingsPage() {
  const { isConnected, user, isCreator } = useWallet();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Settings
            </h1>
            <p className="text-lg text-gray-600">
              Manage your profile and creator settings.
            </p>
          </div>

          <div className="space-y-6">
            {/* User Profile Section */}
            <UserProfile />

            {/* Creator Registration Section */}
            {isConnected && !isCreator && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Become a Creator
                </h2>
                <p className="text-gray-600 mb-4">
                  Register as a creator to start monetizing your content. 
                  Registration requires a one-time payment of 100 $PLATFORM tokens.
                </p>
                <CreatorRegistrationButton size="lg" />
              </div>
            )}

            {/* Creator Status Section */}
            {isConnected && isCreator && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-2">
                  Creator Account Active
                </h2>
                <p className="text-green-700">
                  You are registered as a creator and can post premium content.
                </p>
              </div>
            )}

            {/* Wallet Information */}
            {isConnected && user && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Wallet Information
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account ID:</span>
                    <span className="font-mono text-sm">{user.hedera_account_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCreator 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isCreator ? 'Creator' : 'User'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}