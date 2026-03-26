/* eslint-disable import/no-extraneous-dependencies */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import Select from 'react-tailwindcss-select';

const MultiSelects = ({
  placeholder,
  option,
  value,
  handleChange,
  enableOptionCrud = false,
  onEditOption,
  onDeleteOption,
}) => {
  return (
    <Select
      placeholder={placeholder}
      primaryColor={'blue'}
      value={value}
      isMultiple={true}
      isSearchable={true}
      isClearable={true}
      onChange={handleChange}
      options={option}
      formatOptionLabel={
        enableOptionCrud
          ? (item) => {
              if (item.value === 'ADD') {
                return (
                  <div className="mt-1 flex items-center gap-2 border-t pl-2 pr-2 font-bold text-primary">
                    {item.label}
                  </div>
                );
              }

              return (
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{item.label}</span>
                    {item.description && (
                      <span className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEditOption?.(item);
                      }}
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      type="button"
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteOption?.(item);
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            }
          : null
      }
      classNames="max-h-48"
    />
  );
};

export default MultiSelects;
