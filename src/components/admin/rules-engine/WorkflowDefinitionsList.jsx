'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  Layers,
  Network,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

export default function WorkflowDefinitionsList({
  definitions = [],
  isLoading,
  onSelectDefinition,
  onOpenVersions,
  onArchive,
  onUnarchive,
  onCreateWorkflow,
}) {
  const [statusTab, setStatusTab] = useState('ACTIVE'); // 'ACTIVE' | 'ARCHIVED'
  const selectedModuleFilter = 'ALL';

  const activeCount = definitions.filter((d) => d.status !== 'ARCHIVED').length;
  const archivedCount = definitions.filter(
    (d) => d.status === 'ARCHIVED',
  ).length;

  const filteredDefinitions = definitions.filter((item) => {
    // Status Filter: ACTIVE tab shows non-archived, ARCHIVED tab shows archived
    if (statusTab === 'ACTIVE' && item.status === 'ARCHIVED') return false;
    if (statusTab === 'ARCHIVED' && item.status !== 'ARCHIVED') return false;

    // Module Filter
    if (selectedModuleFilter === 'ALL') return true;
    return item.module === selectedModuleFilter;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Top Filter Bar: Status Tabs & Module Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
        {/* Status Tabs: Active vs Archived */}
        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList className="border">
            <TabsTrigger value="ACTIVE" className="gap-2 text-xs">
              <Network size={14} />
              Active Workflows ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="ARCHIVED" className="gap-2 text-xs">
              <Archive size={14} />
              Archived ({archivedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Module Filter Pills */}
        {/* <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Module:
          </span>
          {['ALL', 'ORDER', 'INVOICE', 'PAYMENT'].map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => setSelectedModuleFilter(mod)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedModuleFilter === mod
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mod}
            </button>
          ))}
        </div> */}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="space-y-3 p-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredDefinitions.length === 0 && (
        <div style={{ height: 'calc(100vh - 220px)', width: '100%' }}>
          <EmptyStageComponent
            heading={
              statusTab === 'ARCHIVED'
                ? 'No Archived Workflows'
                : 'No Workflow Definitions Found'
            }
            subHeading={
              statusTab === 'ARCHIVED'
                ? `No archived workflows found for module ${selectedModuleFilter}.`
                : `No workflows defined for module ${selectedModuleFilter}. Click below to create a new workflow.`
            }
            actionBtn={
              statusTab === 'ACTIVE' && (
                <Button size="sm" onClick={onCreateWorkflow}>
                  <Network className="mr-2 h-4 w-4" />
                  Create Workflow Definition
                </Button>
              )
            }
          />
        </div>
      )}

      {!isLoading && filteredDefinitions.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDefinitions.map((def) => {
            const isArchived = def.status === 'ARCHIVED';
            const hasActiveVersion = def.activeVersionId !== null;
            const createdAtFormatted = def.createdAt
              ? moment(def.createdAt).format('MMM D, YYYY')
              : '-';

            return (
              <Card
                key={def.id}
                className={`group relative flex flex-col justify-between border p-4 transition-all ${
                  isArchived
                    ? 'border-gray-200 bg-gray-50/70'
                    : 'hover:border-primary hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isArchived
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      <Network className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs uppercase">
                        {def.module}
                      </Badge>
                      {isArchived ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <Archive className="mr-1 h-3 w-3" /> Archived
                        </Badge>
                      ) : hasActiveVersion ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" /> Draft Only
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary">
                      {def.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {def.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GitBranch size={13} />
                      Active Version ID: {def.activeVersionId ?? 'None'}
                    </span>
                    <span>Created: {createdAtFormatted}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenVersions(def)}
                        title="View Version History"
                      >
                        <Layers className="mr-1 h-3 w-3" />
                        Versions
                      </Button>

                      {/* Archive button - shown ONLY for DRAFT workflows (no active version) */}
                      {!isArchived && !hasActiveVersion && onArchive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onArchive(def.id)}
                          title="Archive Draft Workflow"
                        >
                          <Archive className="mr-1 h-3 w-3" />
                          Archive
                        </Button>
                      )}

                      {isArchived && onUnarchive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          onClick={() => onUnarchive(def.id)}
                          title="Unarchive Workflow"
                        >
                          <ArchiveRestore className="mr-1 h-3 w-3" />
                          Unarchive
                        </Button>
                      )}
                    </div>

                    <Button size="sm" onClick={() => onSelectDefinition(def)}>
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Canvas
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
