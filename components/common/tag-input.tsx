'use client';

import { cn } from '@/lib/utils';
import { Tag as TagIcon, X } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

interface TagInputProps {
  value?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Thêm tag (nhấn Enter hoặc dấu phẩy)...',
  maxTags = 10,
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (rawTag: string) => {
    const trimmed = rawTag.trim().replace(/^#/, '').toLowerCase();
    if (!trimmed) return;

    // Định dạng gắn tag với prefix #
    const formattedTag = `#${trimmed}`;

    if (value.includes(formattedTag)) {
      setInputValue('');
      return;
    }

    if (value.length >= maxTags) return;

    onChange([...value, formattedTag]);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  return (
    <div
      className={cn(
        'w-full flex flex-wrap items-center gap-1.5 p-2 bg-base border border-border rounded-xl transition-all focus-within:border-brand/60 focus-within:ring-1 focus-within:ring-brand/40 min-h-[44px]',
        disabled && 'opacity-60 pointer-events-none cursor-not-allowed bg-base/40',
        className
      )}
    >
      <TagIcon className="w-3.5 h-3.5 text-text-secondary ml-1 mr-0.5 shrink-0" />

      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20 text-xs font-medium group transition-colors select-none"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-brand/60 hover:text-danger hover:bg-danger/10 rounded p-0.5 transition-colors outline-none"
              title={`Xóa tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}

      {!disabled && value.length < maxTags && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              handleAddTag(inputValue);
            }
          }}
          placeholder={value.length === 0 ? placeholder : 'Thêm tag...'}
          className="flex-1 min-w-[120px] bg-transparent border-none text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-0 focus-visible:outline-none p-0.5"
        />
      )}
    </div>
  );
}
