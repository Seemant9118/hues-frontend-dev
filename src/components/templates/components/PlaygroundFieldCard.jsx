'use client';

import { ChevronDown, ChevronUp, Sliders, Trash2 } from 'lucide-react';
import React from 'react';

export default function PlaygroundFieldCard({
  field,
  index,
  totalFields,
  onMove,
  onToggleRequired,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm transition hover:border-neutral-300">
      {/* Left details */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-neutral-100 bg-neutral-50 px-2 py-1 text-neutral-400">
          <button
            type="button"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="hover:text-neutral-700 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <span className="text-[10px] font-bold text-neutral-500">
            #{index + 1}
          </span>
          <button
            type="button"
            onClick={() => onMove(index, 'down')}
            disabled={index === totalFields - 1}
            className="hover:text-neutral-700 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-neutral-800">
              {field.label}
            </h4>
            {field.required && (
              <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                Required
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600">
              Type: {field.type}
            </span>
            {field.placeholder && (
              <span>Placeholder: &quot;{field.placeholder}&quot;</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Field Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleRequired(index)}
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
            field.required
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
          }`}
        >
          {field.required ? 'Required' : 'Optional'}
        </button>

        <button
          type="button"
          onClick={() => onEdit(index)}
          className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-primary"
          title="Edit Field Configuration"
        >
          <Sliders size={14} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(index)}
          className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
          title="Delete Field"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
