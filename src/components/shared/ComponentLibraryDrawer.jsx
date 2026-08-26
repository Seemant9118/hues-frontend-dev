'use client';

import React from 'react';
import {
  Type,
  Hash,
  List,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  FileUp,
  LineChart,
} from 'lucide-react';

const toolboxItems = [
  {
    type: 'TEXT',
    label: 'Text Field',
    icon: Type,
    desc: 'Single-line text entry',
  },
  { type: 'NUMBER', label: 'Number Field', icon: Hash, desc: 'Numeric values' },
  {
    type: 'SELECT',
    label: 'Dropdown Select',
    icon: List,
    desc: 'Choose from a list',
  },
  {
    type: 'DATE',
    label: 'Date Picker',
    icon: Calendar,
    desc: 'Calendar date selection',
  },
  {
    type: 'CURRENCY',
    label: 'Currency',
    icon: DollarSign,
    desc: 'Money/price field',
  },
  {
    type: 'DECIMAL',
    label: 'Decimal Number',
    icon: LineChart,
    desc: 'Floating-point values',
  },
  {
    type: 'FILE',
    label: 'File Upload',
    icon: FileUp,
    desc: 'Upload documents or images',
  },
];

export default function ComponentLibraryDrawer({
  isOpen,
  onClose,
  onAddField,
}) {
  if (!isOpen) return null;

  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData('text/plain', fieldType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="animate-slide-in fixed right-0 top-0 z-[9998] flex h-full w-[360px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="mt-16 flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Component Library
            </h3>
            <p className="text-[10px] text-slate-500">
              Drag or click to add fields
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          title="Close Library"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Field List Container */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Standard Field Library
        </span>

        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {toolboxItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
                onClick={() => onAddField(item.type)}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/30 hover:shadow"
              >
                <div className="rounded-lg bg-slate-50 p-2 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-700 transition-colors group-hover:text-blue-700">
                    {item.label}
                  </h4>
                  <p className="truncate text-[10px] text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip footer */}
      <div className="select-none border-t border-slate-100 bg-slate-50/50 p-4 text-center text-[10px] text-slate-400">
        Tip: Drag components directly into the form border, or simply click to
        append them instantly.
      </div>
    </div>
  );
}
