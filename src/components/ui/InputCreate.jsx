import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export default function InputCreate({
  value = [],
  onChange,
  placeholder = 'Add tag and press Enter',
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();

    if (!trimmed) return;
    if (value.includes(trimmed)) return;

    onChange([...value, trimmed]);
    setInput('');
  };

  const removeTag = (index) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }

    // optional UX: backspace removes last tag
    if (e.key === 'Backspace' && !input && value.length) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs"
          >
            {tag}
            <X
              size={12}
              className="cursor-pointer text-gray-500 hover:text-red-500"
              onClick={() => removeTag(index)}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
