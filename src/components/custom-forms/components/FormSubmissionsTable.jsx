'use client';

import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Filter, RefreshCw } from 'lucide-react';
import React from 'react';
import { useSubmissionTableColumns } from '../hooks/useSubmissionTableColumns';

export const FormSubmissionsTable = ({
  submissions = [],
  isLoading = false,
  isRefetching = false,
  onRefresh,
  customFormsList = [],
  selectedFormId,
  onFormFilterChange,
  onInspect,
}) => {
  const columns = useSubmissionTableColumns({ onInspect });

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Form Filter Selector */}
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs">
            <Filter size={14} className="text-neutral-400" />
            <select
              value={selectedFormId}
              onChange={(e) => onFormFilterChange(e.target.value)}
              className="bg-transparent font-medium text-neutral-700 focus:outline-none"
            >
              <option value="ALL">All Custom Forms</option>
              {customFormsList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (#{f.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefetching}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={14}
            className={isRefetching ? 'animate-spin text-blue-600' : ''}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loading />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400">
            No form submissions found.
          </div>
        ) : (
          <DataTable columns={columns} data={submissions} />
        )}
      </div>
    </div>
  );
};

export default FormSubmissionsTable;
