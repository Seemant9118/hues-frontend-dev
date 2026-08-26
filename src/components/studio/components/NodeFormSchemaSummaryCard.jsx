'use client';

import React, { useMemo, useState } from 'react';
import {
  Asterisk,
  Check,
  CheckSquare,
  Code,
  Copy,
  FileText,
  ShieldCheck,
  Table,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export default function NodeFormSchemaSummaryCard({
  nodeType,
  isSystemStart,
  formConfigId,
  moduleName,
  sysFields = [],
  isSysFormLoading,
  customFields = [],
  isCustomFormLoading,
  roles = [],
  nodeContent,
}) {
  const [viewMode, setViewMode] = useState('table');
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyJson = (fieldsData) => {
    const jsonContent = JSON.stringify(fieldsData || [], null, 2);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(jsonContent);
      setCopiedJson(true);
      toast.success('Form schema JSON copied to clipboard!');
      setTimeout(() => setCopiedJson(false), 2500);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'label',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Field Label" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-neutral-800">
            {row.original.label || row.original.key}
          </span>
        ),
      },
      {
        accessorKey: 'key',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Key" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-[11px] text-neutral-500">
            {row.original.key}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <span className="text-[11px] font-semibold uppercase text-primary">
            {row.original.type || 'TEXT'}
          </span>
        ),
      },
      {
        accessorKey: 'kind',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Kind" />
        ),
        cell: ({ row }) => {
          const kind = row.original.kind || 'SYSTEM';
          return (
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                kind === 'CUSTOM'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {kind}
            </span>
          );
        },
      },
      {
        accessorKey: 'required',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Required" />
        ),
        cell: ({ row }) =>
          row.original.required ? (
            <span className="flex items-center gap-0.5 text-xs font-bold text-red-500">
              <Asterisk className="h-3 w-3" /> Yes
            </span>
          ) : (
            <span className="text-neutral-400">No</span>
          ),
      },
      {
        accessorKey: 'visible',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Visible" />
        ),
        cell: ({ row }) =>
          row.original.visible !== false ? (
            <span className="font-semibold text-blue-600">Visible</span>
          ) : (
            <span className="text-neutral-400">Hidden</span>
          ),
      },
    ],
    [],
  );

  return (
    <>
      {/* SYSTEM FORM SCHEMA OVERVIEW (ONLY for System Start node) */}
      {isSystemStart && (
        <Card className="space-y-3 border bg-white p-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="flex items-center gap-2 font-bold text-gray-900">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              System Form Schema Summary ({moduleName})
            </h4>
            <Badge variant="secondary" className="text-xs">
              {sysFields.length} System Fields
            </Badge>
          </div>

          {isSysFormLoading ? (
            <p className="animate-pulse py-4 text-center text-muted-foreground">
              Loading system form schema...
            </p>
          ) : sysFields.length > 0 ? (
            <Tabs
              value={viewMode}
              onValueChange={setViewMode}
              className="w-full space-y-3 pt-1"
            >
              <div className="flex items-center justify-between">
                <TabsList className="border border-neutral-200 bg-neutral-100/60 p-1">
                  <TabsTrigger value="table" className="gap-1.5 text-xs">
                    <Table className="h-3.5 w-3.5" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="json" className="gap-1.5 text-xs">
                    <Code className="h-3.5 w-3.5" />
                    JSON View
                  </TabsTrigger>
                </TabsList>

                {viewMode === 'json' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyJson(sysFields)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy JSON
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Table View Tab Content */}
              <TabsContent value="table" className="mt-0 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Configured Fields Snapshot ({sysFields.length})
                </h4>
                <div className="scrollBarStyles h-40 overflow-y-auto">
                  <DataTable columns={columns} data={sysFields} />
                </div>
              </TabsContent>

              {/* JSON View Tab Content */}
              <TabsContent value="json" className="mt-0">
                <h4 className="text-xsfont-bold uppercase tracking-wider text-neutral-500">
                  Schema JSON Output
                </h4>
                <div className="relative">
                  <pre className="scrollBarStyles h-44 overflow-auto bg-black py-4 pl-4 font-mono text-xs text-emerald-400">
                    <code>{JSON.stringify(sysFields, null, 2)}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-muted-foreground">
              No fields configured for this system form.
            </p>
          )}
        </Card>
      )}

      {/* CUSTOM FORM SCHEMA OVERVIEW (ONLY for Custom Form nodes) */}
      {!isSystemStart && nodeType === 'FORM' && (
        <Card className="space-y-3 border bg-white p-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="flex items-center gap-2 font-bold text-gray-900">
              <FileText className="h-4 w-4 text-emerald-600" />
              Selected Custom Form Schema Summary{' '}
              {formConfigId ? `(ID: #${formConfigId})` : ''}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {formConfigId
                ? `${customFields.length} Custom Fields`
                : '0 Fields'}
            </Badge>
          </div>

          {!formConfigId ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              <p className="font-medium">
                No custom form selected yet. Select a custom form from the
                dropdown above to view its schema preview.
              </p>
            </div>
          ) : isCustomFormLoading ? (
            <p className="animate-pulse py-4 text-center text-muted-foreground">
              Loading custom form details...
            </p>
          ) : customFields.length > 0 ? (
            <Tabs
              value={viewMode}
              onValueChange={setViewMode}
              className="w-full space-y-3 pt-1"
            >
              <div className="flex items-center justify-between">
                <TabsList className="border border-neutral-200 bg-neutral-100/60 p-1">
                  <TabsTrigger value="table" className="gap-1.5 text-xs">
                    <Table className="h-3.5 w-3.5" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="json" className="gap-1.5 text-xs">
                    <Code className="h-3.5 w-3.5" />
                    JSON View
                  </TabsTrigger>
                </TabsList>

                {viewMode === 'json' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyJson(customFields)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy JSON
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Table View Tab Content */}
              <TabsContent value="table" className="mt-0 space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Configured Fields Snapshot ({customFields.length})
                </h4>
                <div className="max-h-60 overflow-y-auto rounded-xl border border-neutral-200">
                  <DataTable columns={columns} data={customFields} />
                </div>
              </TabsContent>

              {/* JSON View Tab Content */}
              <TabsContent value="json" className="mt-0 space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Schema JSON Output
                </h4>
                <div className="relative rounded-xl border border-neutral-800 bg-slate-950 p-4 shadow-inner">
                  <pre className="max-h-52 overflow-auto font-mono text-xs text-emerald-400">
                    <code>{JSON.stringify(customFields, null, 2)}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-muted-foreground">
              No fields configured for this custom form.
            </p>
          )}
        </Card>
      )}

      {/* APPROVAL STEP OVERVIEW */}
      {!isSystemStart && nodeType === 'APPROVAL' && (
        <Card className="space-y-3 border bg-white p-4">
          <h4 className="flex items-center gap-2 font-bold text-gray-900">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            Approval Decision Settings
          </h4>
          <div className="space-y-2 text-xs">
            <p className="text-muted-foreground">
              Available Roles for Assignment:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <Badge
                  key={r.id || r.code}
                  variant={
                    nodeContent.assignee?.roleCode === r.code
                      ? 'default'
                      : 'outline'
                  }
                  className="text-xs"
                >
                  {r.name || r.code}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* OTHER STEP TYPES */}
      {!isSystemStart && !['FORM', 'APPROVAL'].includes(nodeType) && (
        <Card className="space-y-2 border bg-gray-50 p-4 text-xs">
          <h4 className="font-bold text-gray-800">Step Instructions</h4>
          <p className="text-muted-foreground">
            This step ({nodeType}) is auto-executed by the backend workflow
            engine upon state transition.
          </p>
        </Card>
      )}
    </>
  );
}
