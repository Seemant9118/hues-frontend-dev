'use client';

import React from 'react';
import {
  CheckCircle,
  CheckSquare,
  FileText,
  GitCommit,
  GripVertical,
  Network,
  Plus,
  SlidersHorizontal,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { STEP_TYPES } from '@/utils/workflowGraphTransformer';

export function getStepIcon(type) {
  switch (type) {
    case 'SYSTEM':
      return <Zap className="h-4 w-4 text-amber-500" />;
    case 'APPROVAL':
      return <CheckSquare className="h-4 w-4 text-blue-500" />;
    case 'FORM':
      return <FileText className="h-4 w-4 text-emerald-500" />;
    case 'DATA_UPDATE':
      return <SlidersHorizontal className="h-4 w-4 text-purple-600" />;
    case 'DOCUMENT_UPLOAD':
      return <UploadCloud className="h-4 w-4 text-purple-500" />;
    case 'STATUS_UPDATE':
      return <GitCommit className="h-4 w-4 text-indigo-500" />;
    case 'END':
      return <CheckCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Network className="h-4 w-4 text-gray-500" />;
  }
}

export default function StepPaletteSidebar({ onAddStep }) {
  const allowedTypes = ['FORM', 'DATA_UPDATE', 'DOCUMENT_UPLOAD', 'END'];
  const availableStepTypes = STEP_TYPES.filter((st) =>
    allowedTypes.includes(st.type),
  );

  return (
    <div className="z-20 col-span-3 max-h-[440px] space-y-3 overflow-y-auto rounded-lg border bg-white p-3 shadow-sm">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Step Palette
      </h4>
      <div className="space-y-2">
        {availableStepTypes.map((st) => (
          <button
            key={st.type}
            type="button"
            onClick={() => onAddStep(st)}
            className="flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs font-medium transition-all hover:border-primary hover:bg-primary/5 active:bg-primary/10"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5 text-gray-400" />
              {getStepIcon(st.type)}
              <span>{st.label}</span>
            </div>
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
