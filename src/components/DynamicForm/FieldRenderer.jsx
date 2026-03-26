import DatePickers from '@/components/ui/DatePickers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultiSelects from '@/components/ui/MultiSelects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Info, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import { DataTable } from '../table/data-table';
import ErrorBox from '../ui/ErrorBox';
import Tooltips from '../auth/Tooltips';

const FieldRenderer = React.memo(function FieldRenderer({
  field,
  value,
  onChange,
  error,
  formData,
  dispatchDetails,

  /* optional props */
  enableOptionCrud = false,
  onEditOption,
  onDeleteOption,
  // variant = 'top', // 'top' or 'inline'
}) {
  const {
    name,
    disabled,
    headLabel,
    label,
    required,
    type,
    placeholder,
    options,
    rows,
    tableData,
    tableColumns,
    component: CustomComponent,
  } = field;

  // const isInline = variant === 'inline';

  return (
    <div
      className={cn(
        'group flex flex-col gap-2 transition-all duration-200',
        required && !value && 'rounded-md bg-red-50/5 p-1',
      )}
    >
      {/* HEAD LABEL */}
      {headLabel && <div className="text-md mb-1 font-bold">{headLabel}</div>}

      {/* LABEL */}
      {label && (
        <Label
          className={cn(
            'text-[13px] font-bold text-foreground/80 transition-colors group-focus-within:text-primary',
            required && 'after:ml-0.5 after:text-red-500 after:content-["*"]',
          )}
        >
          {label}{' '}
          {enableOptionCrud && (
            <Tooltips
              trigger={<Info size={14} />}
              content="This will be used as the default. You can change it later."
            />
          )}
        </Label>
      )}

      <div className="flex-1">
        {/* CUSTOM FIELD */}
        {type === 'custom' && CustomComponent && (
          <CustomComponent
            formData={formData}
            dispatchDetails={dispatchDetails}
          />
        )}

        {/* TEXT */}
        {type === 'text' && (
          <Input
            className="h-10 text-[14px]"
            placeholder={placeholder || 'Enter value'}
            value={value || ''}
            disabled={disabled}
            onChange={(e) => onChange(name, e.target.value)}
          />
        )}

        {/* NUMBER */}
        {(type === 'number' || type === 'input') && (
          <Input
            className="h-10 text-[14px]"
            type="number"
            placeholder={placeholder || 'Enter value'}
            value={value || ''}
            onChange={(e) => onChange(name, Number(e.target.value))}
          />
        )}

        {/* TEXTAREA */}
        {type === 'textarea' && (
          <Textarea
            className="min-h-[80px] text-[14px]"
            rows={rows || 2}
            placeholder={placeholder || 'Enter value'}
            value={value || ''}
            onChange={(e) => onChange(name, e.target.value)}
          />
        )}

        {/* SELECT */}
        {type === 'select' && (
          <Select
            value={value}
            onValueChange={(v) => onChange(name, v, field)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 text-[14px]">
              {value !== undefined && value !== null && value !== '' ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">
                    {options?.find((opt) => opt.value === value)?.label ||
                      value}
                  </span>
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-600">
                    Selected
                  </span>
                </div>
              ) : (
                <SelectValue placeholder={placeholder || 'Select'} />
              )}
            </SelectTrigger>

            <SelectContent className="max-h-60 min-w-[200px] p-1">
              {options?.map((opt) => {
                const isAddOption = opt.value === 'ADD';

                if (isAddOption) {
                  return (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="mt-1 border-t pl-2 pr-2 font-bold text-primary"
                    >
                      {opt.label}
                    </SelectItem>
                  );
                }

                return (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="pr-1"
                    description={opt.description}
                    actions={
                      enableOptionCrud ? (
                        <div className="ml-auto flex shrink-0 items-center gap-0.5 pl-2">
                          <button
                            type="button"
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onEditOption?.(opt, field);
                            }}
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeleteOption?.(opt, field);
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ) : null
                    }
                  >
                    {opt.label}
                    {opt.value === value && (
                      <span className="ml-2 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-600">
                        Selected
                      </span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {/* MULTI-SELECT */}
        {type === 'multi-select' && (
          <div className="flex flex-col gap-0">
            <MultiSelects
              placeholder={placeholder || 'Select multiple...'}
              option={options || []}
              value={
                Array.isArray(value)
                  ? value.every((v) => typeof v === 'object')
                    ? value
                    : value
                        .map(
                          (valStr) =>
                            options?.find((opt) => opt.value === valStr) || {
                              label: valStr,
                              value: valStr,
                            },
                        )
                        .filter(Boolean)
                  : typeof value === 'string' && value
                    ? value
                        .split(',')
                        .map(
                          (valStr) =>
                            options?.find(
                              (opt) => opt.value === valStr.trim(),
                            ) || {
                              label: valStr.trim(),
                              value: valStr.trim(),
                            },
                        )
                        .filter(Boolean)
                    : null
              }
              handleChange={(v) => {
                // v is either an array of objects for selected items or null
                const updatedValues = v ? v.map((item) => item.value) : [];
                onChange(name, updatedValues, field);
              }}
              enableOptionCrud={enableOptionCrud}
              onEditOption={(opt) => onEditOption?.(opt, field)}
              onDeleteOption={(opt) => onDeleteOption?.(opt, field)}
            />
          </div>
        )}
        {/* DATE */}
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

        {/* RADIO */}
        {type === 'radio' && options && (
          <div className="mt-1 flex flex-col gap-4">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(name, opt.value)}
                  className="accent-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}

        {/* CHECKBOX */}
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

        {/* TABLE */}
        {type === 'table' && (
          <DataTable data={tableData} columns={tableColumns} />
        )}

        {/* ERROR */}
        {error && <ErrorBox msg={error} />}
      </div>
    </div>
  );
});

export default FieldRenderer;
