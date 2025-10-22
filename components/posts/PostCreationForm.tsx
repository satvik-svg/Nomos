'use client';

import { useState } from 'react';
import { CreatePostData } from '@/types';
import Button from '@/components/ui/Button';

interface PostCreationFormProps {
  onSubmit: (postData: CreatePostData) => Promise<void>;
  onCancel?: () => void;
  defaultPrice?: number;
}

export default function PostCreationForm({ 
  onSubmit, 
  onCancel,
  defaultPrice = 10 
}: PostCreationFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState(defaultPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    price?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    if (isPremium) {
      if (price <= 0) {
        newErrors.price = 'Price must be greater than 0';
      } else if (price > 1000000) {
        newErrors.price = 'Price must be less than 1,000,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postData: CreatePostData = {
        title: title.trim(),
        content: content.trim(),
        is_premium: isPremium,
        price: isPremium ? price : undefined,
      };

      await onSubmit(postData);

      // Reset form on success
      setTitle('');
      setContent('');
      setIsPremium(false);
      setPrice(defaultPrice);
      setErrors({});
    } catch (error) {
      console.error('Error submitting post:', error);
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter post title..."
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Content Textarea */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Write your content here..."
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {content.length} characters
        </p>
      </div>

      {/* Premium Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isPremium"
          checked={isPremium}
          onChange={(e) => setIsPremium(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
          Premium Content
        </label>
      </div>

      {/* Price Input (shown only for premium content) */}
      {isPremium && (
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price ($PLATFORM tokens)
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter price..."
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Readers will pay {price} $PLATFORM tokens to access this content
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            variant="secondary"
            size="lg"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="Publishing..."
          size="lg"
        >
          Publish Post
        </Button>
      </div>
    </form>
  );
}
