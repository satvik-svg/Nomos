'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import CreatorRegistrationModal from './CreatorRegistrationModal';

interface CreatorRegistrationButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function CreatorRegistrationButton({ 
  className = '',
  variant = 'primary',
  size = 'md'
}: CreatorRegistrationButtonProps) {
  const { isConnected, isCreator, user, error, refreshUserData } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = async () => {
    // Refresh user data to update creator status
    await refreshUserData();
    console.log('Creator registration successful');
  };

  // Don't render if user is already a creator
  if (isCreator) {
    return null;
  }

  // Don't render if wallet is not connected
  if (!isConnected || !user) {
    return null;
  }

  const baseClasses = 'font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={buttonClasses}
        disabled={!!error}
      >
        Become a Creator (100 $PLATFORM)
      </button>

      <CreatorRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}