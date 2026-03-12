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
import { Pencil, Trash2 } from 'lucide-react';
import MultiSelects from '@/components/ui/MultiSelects';
import { DataTable } from '../table/data-table';
import ErrorBox from '../ui/ErrorBox';

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

  return (
    <div className="flex flex-col gap-1">
      {/* HEAD LABEL */}
      {headLabel && <div className="text-md font-bold">{headLabel}</div>}

      {/* LABEL */}
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

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
          placeholder={placeholder}
          value={value || ''}
          disabled={disabled}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}

      {/* NUMBER */}
      {(type === 'number' || type === 'input') && (
        <Input
          type="number"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(name, Number(e.target.value))}
        />
      )}

      {/* TEXTAREA */}
      {type === 'textarea' && (
        <Textarea
          rows={rows || 2}
          placeholder={placeholder}
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
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent className="max-h-44">
            {options?.map((opt) => {
              const isAddOption = opt.value === 'ADD';

              return (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="flex items-center justify-between gap-2 pr-2"
                >
                  {/* label */}
                  <span className="">{opt.label}</span>

                  {/* CRUD icons */}
                  {enableOptionCrud && !isAddOption && (
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditOption?.(opt, field);
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteOption?.(opt, field);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}

      {/* MULTI-SELECT */}
      {type === 'multi-select' && (
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
                        options?.find((opt) => opt.value === valStr.trim()) || {
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
            onChange(name, updatedValues);
          }}
        />
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
  );
});

export default FieldRenderer;
