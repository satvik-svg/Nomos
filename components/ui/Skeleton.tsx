'use client';

import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animate = true
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  const animateClass = animate ? 'animate-pulse' : '';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined)
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animateClass}
        ${className}
      `}
      style={style}
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height="1rem"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="ml-3 flex-1">
          <Skeleton variant="text" height="1rem" width="40%" className="mb-2" />
          <Skeleton variant="text" height="0.75rem" width="30%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonPostCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Author info */}
      <div className="flex items-center mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="ml-3 flex-1">
          <Skeleton variant="text" height="1rem" width="30%" className="mb-2" />
          <Skeleton variant="text" height="0.75rem" width="20%" />
        </div>
      </div>

      {/* Title */}
      <Skeleton variant="text" height="1.5rem" width="80%" className="mb-3" />

      {/* Content */}
      <SkeletonText lines={4} className="mb-4" />

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
}
