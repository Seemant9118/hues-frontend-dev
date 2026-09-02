'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactSelect from 'react-select';
import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import {
  useWorkflowModuleMap,
  useWorkflowRuleFields,
} from '@/hooks/workflows/useWorkflowBuilder';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Trash2, Check, GitFork } from 'lucide-react';

export const CONDITION_OPERATORS = [
  { value: 'EQ', label: 'EQ (Equals)' },
  { value: 'NEQ', label: 'NEQ (Not Equals)' },
  { value: 'GT', label: 'GT (Greater Than)' },
  { value: 'GTE', label: 'GTE (Greater Than or Equal)' },
  { value: 'LT', label: 'LT (Less Than)' },
  { value: 'LTE', label: 'LTE (Less Than or Equal)' },
  { value: 'IN', label: 'IN (In Array)' },
  { value: 'NIN', label: 'NIN (Not In Array)' },
  { value: 'EXISTS', label: 'EXISTS (Value Exists)' },
  { value: 'EMPTY', label: 'EMPTY (Value is Empty)' },
];

export default function EdgeConditionModal({
  isOpen,
  onClose,
  edge,
  moduleName = 'ORDER',
  definitionId = null,
  onSaveCondition,
}) {
  const [branchType, setBranchType] = useState('IF');
  const [path, setPath] = useState('');
  const [operator, setOperator] = useState('GT');
  const [valInput, setValInput] = useState('');

  // Map module name e.g. SALES_ORDER -> ORDER, SALES_B2BINVOICE -> INVOICE, PAYMENT -> PAYMENT
  const mappedModule = useWorkflowModuleMap(moduleName);

  // Fetch Rule Fields from backend API using mapped module name
  const { data: ruleFields = [], isLoading: isRuleFieldsLoading } =
    useWorkflowRuleFields(mappedModule, definitionId);

  const fieldOptions = useMemo(() => {
    const list = Array.isArray(ruleFields)
      ? ruleFields
      : typeof ruleFields === 'object' && ruleFields !== null
        ? Object.values(ruleFields).filter(
            (item) => item && typeof item === 'object' && item.path,
          )
        : [];

    return list.map((field) => ({
      value: field.path || '',
      label: field.label ? `${field.label} (${field.path})` : field.path || '',
      rawLabel: field.label || field.path || '',
      fieldData: field,
    }));
  }, [ruleFields]);

  const selectedOption = useMemo(() => {
    if (!path) return null;
    const found = fieldOptions.find((opt) => opt.value === path);
    if (found) return found;
    return { value: path, label: path, rawLabel: path };
  }, [path, fieldOptions]);

  useEffect(() => {
    if (edge?.condition) {
      setBranchType('IF');
      setPath(edge.condition.path || '');
      setOperator(edge.condition.operator || 'GT');
      const val = edge.condition.value;
      if (Array.isArray(val)) {
        setValInput(val.join(', '));
      } else if (val !== undefined && val !== null) {
        setValInput(String(val));
      } else {
        setValInput('');
      }
    } else if (edge?.isElse) {
      setBranchType('ELSE');
      setPath('');
      setOperator('GT');
      setValInput('');
    } else {
      setBranchType('STANDARD');
      setPath('');
      setOperator('GT');
      setValInput('');
    }
  }, [edge]);

  if (!edge) return null;

  const requiresValue = operator !== 'EXISTS' && operator !== 'EMPTY';

  const handleSave = () => {
    if (branchType === 'ELSE') {
      onSaveCondition(edge.id, null, true);
      onClose();
      return;
    }

    if (branchType === 'STANDARD' || !path.trim()) {
      onSaveCondition(edge.id, null, false);
      onClose();
      return;
    }

    let parsedValue;

    if (requiresValue) {
      const trimmed = valInput.trim();
      if (operator === 'IN' || operator === 'NIN') {
        parsedValue = trimmed.split(',').map((item) => {
          const itemTrimmed = item.trim();
          const num = Number(itemTrimmed);
          return itemTrimmed !== '' && !Number.isNaN(num) ? num : itemTrimmed;
        });
      } else {
        const num = Number(trimmed);
        parsedValue = trimmed !== '' && !Number.isNaN(num) ? num : trimmed;
      }
    }

    const condition = {
      path: path.trim(),
      operator,
      ...(requiresValue ? { value: parsedValue } : {}),
    };

    onSaveCondition(edge.id, condition, false);
    onClose();
  };

  const handleClear = () => {
    onSaveCondition(edge.id, null, false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Transition Branch & Condition
              </DialogTitle>
              <DialogDescription className="text-xs">
                Transition from{' '}
                <strong className="font-mono text-gray-800">
                  {edge.sourceId}
                </strong>{' '}
                ➔{' '}
                <strong className="font-mono text-gray-800">
                  {edge.targetId}
                </strong>{' '}
                (<Badge variant="outline">{edge.type || 'COMPLETED'}</Badge>)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          {/* Branch Type Selector */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1 text-xs font-bold text-gray-800">
              <GitFork className="h-3.5 w-3.5 text-indigo-600" />
              Transition Branch Logic Type
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBranchType('IF')}
                className={`rounded-lg border p-2 text-center text-xs font-bold transition-all ${
                  branchType === 'IF'
                    ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                IF (Conditional)
              </button>
              <button
                type="button"
                onClick={() => setBranchType('ELSE')}
                className={`rounded-lg border p-2 text-center text-xs font-bold transition-all ${
                  branchType === 'ELSE'
                    ? 'border-slate-400 bg-slate-100 text-slate-900 ring-2 ring-slate-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                ELSE (Fallback)
              </button>
              <button
                type="button"
                onClick={() => setBranchType('STANDARD')}
                className={`rounded-lg border p-2 text-center text-xs font-bold transition-all ${
                  branchType === 'STANDARD'
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Standard
              </button>
            </div>
          </div>

          {/* Conditional Branch Form */}
          {branchType === 'IF' && (
            <>
              {/* Field Path (ReactSelect dropdown powered by /workflow-builder/rule-fields API) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-800">
                  Field Path (Rule Field Property)
                </Label>
                <ReactSelect
                  value={selectedOption}
                  onChange={(opt) => setPath(opt ? opt.value : '')}
                  options={fieldOptions}
                  isLoading={isRuleFieldsLoading}
                  placeholder={
                    isRuleFieldsLoading
                      ? 'Loading rule fields...'
                      : 'Select or Search Field Path'
                  }
                  isClearable
                  isSearchable
                  styles={getStylesForSelectComponent()}
                  formatOptionLabel={(option) => (
                    <div className="flex flex-col text-xs">
                      <span className="font-bold text-gray-900">
                        {option.fieldData?.label ||
                          option.rawLabel ||
                          option.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {option.value}
                      </span>
                    </div>
                  )}
                  className="text-xs"
                />
              </div>

              {/* Operator Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-800">
                  Condition Operator
                </Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger className="w-full text-xs font-medium">
                    <SelectValue placeholder="Select Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPERATORS.map((op) => (
                      <SelectItem
                        key={op.value}
                        value={op.value}
                        className="text-xs"
                      >
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input */}
              {requiresValue && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-800">
                    Comparison Value
                  </Label>
                  <Input
                    value={valInput}
                    onChange={(e) => setValInput(e.target.value)}
                    placeholder={
                      operator === 'IN' || operator === 'NIN'
                        ? 'e.g. 100, 200, 300'
                        : 'e.g. 10000 or ACTIVE'
                    }
                    className="font-mono text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {operator === 'IN' || operator === 'NIN'
                      ? 'Enter comma-separated values for array comparison.'
                      : 'Numbers will automatically be parsed as numeric.'}
                  </p>
                </div>
              )}
            </>
          )}

          {branchType === 'ELSE' && (
            <div className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800">
              <p className="font-bold">ELSE (Fallback Path):</p>
              <p className="mt-1 text-[11px] text-slate-600">
                This transition will automatically execute when previous sibling
                IF condition(s) evaluate to false.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          {edge.condition || edge.isElse ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear Condition / Reset
            </Button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Save Branch Config
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
