'use client';

import React, { useState } from 'react';
import { Check, Code, Copy, Table } from 'lucide-react';
import { toast } from 'sonner';
import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Loading from '@/components/ui/Loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVersionDetailsColumns } from './hooks/useVersionDetailsColumns';

export default function VersionDetails({
  selectedVersion,
  versionDetails,
  isLoadingDetails = false,
  moduleName,
  onClose,
  open,
}) {
  const isOpen = open !== undefined ? open : !!selectedVersion;
  const [viewMode, setViewMode] = useState('table');
  const [copiedJson, setCopiedJson] = useState(false);

  const columns = useVersionDetailsColumns();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleCopyJson = () => {
    const jsonContent = JSON.stringify(
      versionDetails || selectedVersion || {},
      null,
      2,
    );
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(jsonContent);
      setCopiedJson(true);
      toast.success('Version schema JSON copied to clipboard!');
      setTimeout(() => setCopiedJson(false), 2500);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpenState) => {
        if (!isOpenState) {
          handleClose();
        }
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden p-6">
        <DialogHeader className="border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              v{selectedVersion?.version || selectedVersion?.baseVersion}.0
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-neutral-900">
                Version v
                {selectedVersion?.version || selectedVersion?.baseVersion}.0
                Details
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                Module: {convertSnakeToTitleCase(moduleName)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="scrollBarStyles flex-1 space-y-4 overflow-y-auto py-4">
          {isLoadingDetails ? (
            <Loading />
          ) : (
            <>
              {/* Summary Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-neutral-100 bg-neutral-50/70 p-4 sm:grid-cols-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">
                    Base Version
                  </span>
                  <p className="text-xs font-bold text-neutral-800">
                    v
                    {versionDetails?.baseVersion ||
                      selectedVersion?.baseVersion ||
                      1}
                    .0
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">
                    Revision
                  </span>
                  <p className="text-xs font-bold text-neutral-800">
                    {versionDetails?.revision || selectedVersion?.revision || 0}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">
                    Status
                  </span>
                  <p className="text-xs font-bold text-primary">
                    {selectedVersion?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-400">
                    Total Fields
                  </span>
                  <p className="text-xs font-bold text-neutral-800">
                    {versionDetails?.fields?.length ||
                      selectedVersion?.totalFields ||
                      '--'}
                  </p>
                </div>
              </div>

              {/* View Mode Switcher Tabs */}
              <Tabs
                value={viewMode}
                onValueChange={setViewMode}
                className="w-full"
              >
                <div className="mb-3 flex items-center justify-between">
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
                      onClick={handleCopyJson}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600" />{' '}
                          Copied
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
                <TabsContent value="table" className="mt-0">
                  {versionDetails?.fields &&
                  versionDetails.fields.length > 0 ? (
                    <div>
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Configured Fields Snapshot (
                        {versionDetails.fields.length})
                      </h4>
                      <div className="scrollBarStyles max-h-60 overflow-y-auto rounded-xl border border-neutral-200">
                        <DataTable
                          columns={columns}
                          data={versionDetails.fields}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-xs text-neutral-500">
                      No field details available for this version snapshot.
                    </div>
                  )}
                </TabsContent>

                {/* JSON View Tab Content */}
                <TabsContent value="json" className="mt-0">
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Schema JSON Output
                    </h4>
                    <div className="relative rounded-xl border border-neutral-800 bg-slate-950 p-4 shadow-inner">
                      <pre className="navScrollBarStyles max-h-48 overflow-auto font-mono text-xs text-emerald-400">
                        <code>
                          {JSON.stringify(
                            versionDetails || selectedVersion || {},
                            null,
                            2,
                          )}
                        </code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-neutral-100 pt-3">
          <Button size="sm" variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
