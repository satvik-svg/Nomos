'use client';

import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

export default function UserProfile() {
  const { user, isCreator, isConnected, isLoading } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    content_price_in_platform_token: user?.content_price_in_platform_token || 10,
  });

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500 text-center">
          Connect your wallet to view your profile
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-red-500 text-center">
          Failed to load user profile
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update user profile
      console.log('Saving profile:', editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={editForm.display_name}
              onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself"
            />
          </div>

          {isCreator && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Content Price ($PLATFORM tokens)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.content_price_in_platform_token}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  content_price_in_platform_token: parseFloat(e.target.value) || 0 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm({
                  display_name: user.display_name || '',
                  bio: user.bio || '',
                  content_price_in_platform_token: user.content_price_in_platform_token || 10,
                });
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Display Name</h3>
            <p className="text-gray-900">{user.display_name || 'Not set'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">Hedera Account ID</h3>
            <p className="text-gray-900 font-mono text-sm">{user.hedera_account_id}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700">Account Type</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isCreator 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isCreator ? 'Creator' : 'User'}
              </span>
            </div>
          </div>

          {user.bio && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Bio</h3>
              <p className="text-gray-900">{user.bio}</p>
            </div>
          )}

          {isCreator && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Default Content Price</h3>
              <p className="text-gray-900">
                {user.content_price_in_platform_token || 10} $PLATFORM tokens
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700">Member Since</h3>
            <p className="text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}