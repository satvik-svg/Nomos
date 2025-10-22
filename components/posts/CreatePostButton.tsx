'use client';

interface CreatePostButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function CreatePostButton({ onClick, disabled = false }: CreatePostButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
      <span>Create Post</span>
    </button>
  );
}
