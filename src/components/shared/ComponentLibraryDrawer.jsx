'use client';

import React, { useState } from 'react';
import {
  Type,
  Hash,
  List,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  LineChart,
  CheckSquare,
  CircleDot,
  AlignLeft,
  Mail,
  Phone,
  Info,
  X,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '@/components/ui/context-menu';

const toolboxItems = [
  {
    type: 'TEXT',
    label: 'Text Field',
    icon: Type,
    desc: 'Single-line text entry',
    details: {
      description:
        'A standard single-line text input field used for short responses like names, titles, or short answers.',
      storage: 'Stored as a plain string in the database.',
      useCase: 'Best for short, unstructured text data.',
      validation:
        'Can be validated for minimum/maximum length or regex patterns.',
    },
  },
  {
    type: 'TEXTAREA',
    label: 'Text Area',
    icon: AlignLeft,
    desc: 'Multi-line text entry',
    details: {
      description:
        'A multi-line text input area for longer responses, comments, or descriptions.',
      storage: 'Stored as a text/string block in the database.',
      useCase: 'Best for open-ended questions, feedback, or notes.',
      validation: 'Can be validated for character limits.',
    },
  },
  {
    type: 'NUMBER',
    label: 'Number Field',
    icon: Hash,
    desc: 'Numeric values',
    details: {
      description:
        'An input field specifically for numeric entry. Prevents non-numeric characters.',
      storage: 'Stored as an integer or float number in the database.',
      useCase: 'Best for quantities, ages, or any discrete numeric data.',
      validation: 'Can be restricted by min/max values.',
    },
  },
  {
    type: 'DECIMAL',
    label: 'Decimal Number',
    icon: LineChart,
    desc: 'Floating-point values',
    details: {
      description:
        'An input field for precise numeric values allowing decimals.',
      storage: 'Stored as a decimal/float in the database.',
      useCase: 'Best for exact measurements, percentages, or ratios.',
      validation: 'Can specify decimal precision and min/max limits.',
    },
  },
  {
    type: 'CURRENCY',
    label: 'Currency',
    icon: DollarSign,
    desc: 'Money/price field',
    details: {
      description: 'A field formatted specifically for monetary values.',
      storage:
        'Stored as a numeric or decimal value, often paired with a currency code.',
      useCase: 'Best for prices, budgets, salaries, or costs.',
      validation: 'Validated for valid currency format.',
    },
  },
  {
    type: 'SELECT',
    label: 'Dropdown Select',
    icon: List,
    desc: 'Choose from a list',
    details: {
      description:
        'A dropdown menu allowing the user to select one option from a predefined list.',
      storage: 'Stored as a string representing the selected option key/value.',
      useCase:
        'Best for categorical data with predefined mutually exclusive options.',
      validation: 'Ensures the submitted value is one of the allowed options.',
    },
  },
  {
    type: 'RADIO',
    label: 'Radio Buttons',
    icon: CircleDot,
    desc: 'Single choice selection',
    details: {
      description:
        'A set of radio buttons allowing the user to select exactly one option.',
      storage: 'Stored as a string representing the selected option key/value.',
      useCase:
        'Best when all options should be visible at once and only one can be chosen.',
      validation: 'Ensures exactly one valid option is selected.',
    },
  },
  {
    type: 'CHECKBOX',
    label: 'Checkbox',
    icon: CheckSquare,
    desc: 'Multiple choice or boolean',
    details: {
      description:
        'A single checkbox for true/false or a group of checkboxes for multiple selections.',
      storage: 'Stored as a boolean or an array of selected string values.',
      useCase:
        'Best for opt-ins, agreements, or selecting multiple applicable items.',
      validation: 'Can require minimum/maximum number of selections.',
    },
  },
  {
    type: 'DATE',
    label: 'Date Picker',
    icon: Calendar,
    desc: 'Calendar date selection',
    details: {
      description: 'An interactive calendar picker to select a specific date.',
      storage: 'Stored as an ISO-8601 formatted date string.',
      useCase: 'Best for birth dates, deadlines, or scheduling.',
      validation:
        'Can restrict selection to past, future, or specific date ranges.',
    },
  },
  {
    type: 'EMAIL',
    label: 'Email Address',
    icon: Mail,
    desc: 'Formatted email input',
    details: {
      description:
        'A text field that specifically validates for proper email format.',
      storage: 'Stored as a plain string.',
      useCase: 'Best for collecting user or contact email addresses.',
      validation:
        'Automatically enforces standard email regex validation (e.g., name@domain.com).',
    },
  },
  {
    type: 'PHONE',
    label: 'Phone Number',
    icon: Phone,
    desc: 'Formatted phone input',
    details: {
      description:
        'A text field designed to accept and format telephone numbers.',
      storage: 'Stored as a string, often including country codes.',
      useCase: 'Best for collecting contact numbers.',
      validation: 'Validates against valid phone number patterns or lengths.',
    },
  },
];

export default function ComponentLibraryDrawer({
  isOpen,
  onClose,
  onAddField,
}) {
  const [expandedComponentId, setExpandedComponentId] = useState(null);

  if (!isOpen) return null;

  const handleDragStart = (e, fieldType) => {
    e.dataTransfer.setData('text/plain', fieldType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const toggleDetails = (e, type) => {
    e.stopPropagation();
    setExpandedComponentId(expandedComponentId === type ? null : type);
  };

  return (
    <div className="animate-slide-in fixed right-0 top-0 z-[9998] flex h-full w-[360px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
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
            const isExpanded = expandedComponentId === item.type;

            return (
              <ContextMenu key={item.type}>
                <ContextMenuTrigger>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    className={`group flex flex-col rounded-xl border shadow-sm transition-all duration-200 ${
                      isExpanded
                        ? 'border-blue-400 bg-blue-50/20 shadow'
                        : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 hover:shadow'
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="cursor-pointer rounded-lg bg-slate-50 p-2 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600"
                        onClick={() => onAddField(item.type)}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => onAddField(item.type)}
                      >
                        <h4 className="text-xs font-semibold text-slate-700 transition-colors group-hover:text-blue-700">
                          {item.label}
                        </h4>
                        <p className="truncate text-[10px] text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                      <button
                        onClick={(e) => toggleDetails(e, item.type)}
                        className={`rounded-full p-1.5 transition-colors ${
                          isExpanded
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-400 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                        title={isExpanded ? 'Close Details' : 'View Details'}
                      >
                        {isExpanded ? (
                          <X className="h-3.5 w-3.5" />
                        ) : (
                          <Info className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="flex flex-col gap-3 border-t border-blue-100 bg-blue-50/30 p-3 pb-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Description
                          </span>
                          <p className="text-xs text-slate-700">
                            {item.details.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Storage
                          </span>
                          <p className="text-xs text-slate-700">
                            {item.details.storage}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Validation
                          </span>
                          <p className="text-xs text-slate-700">
                            {item.details.validation}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Best Use Case
                          </span>
                          <p className="text-xs text-slate-700">
                            {item.details.useCase}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="z-[9999]">
                  <ContextMenuItem onClick={(e) => toggleDetails(e, item.type)}>
                    {isExpanded ? 'Close Details' : 'View Details'}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
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
