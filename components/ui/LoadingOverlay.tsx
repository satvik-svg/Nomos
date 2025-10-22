'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  transparent?: boolean;
}

export default function LoadingOverlay({ 
  isLoading, 
  text = 'Loading...',
  transparent = false
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${transparent ? 'bg-black bg-opacity-30' : 'bg-white bg-opacity-90'}
      `}
    >
      <div className="text-center">
        <LoadingSpinner size="xl" color={transparent ? 'white' : 'primary'} />
        <p className={`mt-4 text-lg font-medium ${transparent ? 'text-white' : 'text-gray-900'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}
