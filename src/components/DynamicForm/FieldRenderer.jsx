import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import DatePickers from '@/components/ui/DatePickers';
import { DataTable } from '../table/data-table';

const FieldRenderer = React.memo(function FieldRenderer({
  field,
  value,
  onChange,
  error,
}) {
  const {
    name,
    label,
    required,
    type,
    placeholder,
    options,
    rows,
    tableData,
    tableColumns,
  } = field;

  return (
    <div className="flex flex-col gap-1">
      {/* LABEL */}
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* INPUT TYPES */}
      {type === 'text' && (
        <Input
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}

      {type === 'number' && (
        <Input
          type="number"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(name, Number(e.target.value))}
        />
      )}

      {type === 'textarea' && (
        <Textarea
          rows={rows || 2}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}

      {type === 'select' && (
        <Select value={value || ''} onValueChange={(v) => onChange(name, v)}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {type === 'date' && (
        <div className="relative flex items-center rounded-sm border p-2">
          <DatePickers
            selected={value ? new Date(value) : null}
            onChange={(date) => onChange(name, date)}
            dateFormat="dd/MM/yyyy"
            popperPlacement="right-end"
            placeholderText="dd/mm/yyyy"
            className="w-full"
          />
        </div>
      )}

      {type === 'radio' && options && (
        <div className="mt-1 flex items-center gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(name, opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'checkbox' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(name, e.target.checked)}
          />
          <Label>{label}</Label>
        </div>
      )}

      {type === 'table' && (
        <DataTable data={tableData} columns={tableColumns} />
      )}

      {/* ERROR */}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default FieldRenderer;
