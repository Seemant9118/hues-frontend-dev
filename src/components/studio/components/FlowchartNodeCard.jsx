'use client';

import React from 'react';
import {
  Eye,
  Filter,
  GitFork,
  Link as LinkIcon,
  Trash2,
  Unlink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStepIcon } from './StepPaletteSidebar';

const NODE_WIDTH = 220;

export default function FlowchartNodeCard({
  node,
  isSelected,
  isUnconnected,
  isLinkingSource,
  isLinkingTargetCandidate,
  linkingSourceId,
  outgoingEdges,
  isEditMode,
  onNodeMouseDown,
  onSelectNode,
  onConnectNodes,
  onInspectNode,
  onDeleteNode,
  onDeleteEdge,
  onEditEdgeCondition,
  onSetLinkingSourceId,
}) {
  const isSystemStart = node.type === 'SYSTEM' || node.content?.start;
  const isFormMissing =
    node.type === 'FORM' && !node.content?.formConfigurationId;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: `${NODE_WIDTH}px`,
      }}
      onMouseDown={(e) => onNodeMouseDown(e, node.id)}
      onClick={() => {
        if (linkingSourceId && linkingSourceId !== node.id) {
          onConnectNodes(linkingSourceId, node.id);
        } else {
          onSelectNode(node.id);
        }
      }}
      className={`group z-10 flex flex-col justify-between rounded-xl border bg-white p-3 shadow-md transition-all ${
        isEditMode ? 'cursor-move' : 'cursor-pointer'
      } ${
        isLinkingSource
          ? 'scale-105 border-indigo-600 ring-4 ring-indigo-500/30'
          : isLinkingTargetCandidate
            ? 'border-dashed border-indigo-400 bg-indigo-50/20 ring-2 ring-indigo-400/40 hover:bg-indigo-50'
            : isFormMissing
              ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-400/40'
              : isUnconnected
                ? 'border-red-500 ring-2 ring-red-400/30'
                : isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-neutral-200 hover:border-neutral-400'
      }`}
    >
      {/* Left Input Port Handle */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (linkingSourceId && linkingSourceId !== node.id) {
            onConnectNodes(linkingSourceId, node.id);
          }
        }}
        className={`absolute -left-2.5 top-8 h-4 w-4 -translate-y-1/2 rounded-full border-2 bg-white transition-all ${
          isLinkingTargetCandidate
            ? 'animate-bounce border-indigo-600 bg-indigo-100 ring-4 ring-indigo-400/50'
            : 'border-indigo-600'
        }`}
        title="Input Port (Target)"
      />

      {/* Node Card Header */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {getStepIcon(node.type)}
          <span className="truncate text-xs font-bold text-gray-900">
            {node.name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 text-gray-400 hover:text-primary"
            title="View Node & Form Details"
            onClick={(e) => {
              e.stopPropagation();
              onInspectNode(node);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>

          {isEditMode && !isSystemStart && (
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 text-red-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(node.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Node Type & Connection Badges */}
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <Badge variant="outline" className="font-mono text-[9px] uppercase">
          {node.type}
        </Badge>
        {isSystemStart && (
          <Badge className="bg-amber-500 text-[9px] text-white">Start</Badge>
        )}
        {isFormMissing && (
          <Badge className="bg-amber-500 text-[9px] font-semibold text-white">
            Form Required
          </Badge>
        )}
        {isUnconnected && (
          <Badge variant="destructive" className="text-[9px]">
            Unconnected
          </Badge>
        )}
      </div>

      {/* Active Connections Tray & Quick Disconnect Buttons */}
      {outgoingEdges.length > 0 && (
        <div className="mt-2 space-y-1 border-t pt-1.5 text-[10px]">
          <span className="text-[9px] font-bold uppercase text-muted-foreground">
            Outgoing Connections:
          </span>
          {outgoingEdges.map((eg) => {
            const hasCond = Boolean(eg.condition && eg.condition.path);
            const hasSiblingWithCondition = outgoingEdges.some(
              (other) =>
                other.id !== eg.id &&
                (other.type || other.on) === (eg.type || eg.on) &&
                Boolean(other.condition && other.condition.path),
            );
            const isElse = eg.isElse || (!hasCond && hasSiblingWithCondition);

            return (
              <div
                key={eg.id}
                className={`flex items-center justify-between rounded px-1.5 py-0.5 font-mono text-[9px] ${
                  hasCond
                    ? 'bg-amber-100/80 font-bold text-amber-950'
                    : isElse
                      ? 'bg-slate-200 font-bold text-slate-950'
                      : 'bg-indigo-50/70 text-indigo-900'
                }`}
              >
                <span
                  className="truncate"
                  title={`➔ ${eg.targetId} (${eg.type || 'DEFAULT'}) ${
                    hasCond ? '[IF]' : isElse ? '[ELSE]' : ''
                  }`}
                >
                  {hasCond ? '[IF] ' : isElse ? '[ELSE] ' : ''}➔ {eg.targetId} (
                  {eg.type || 'DEFAULT'})
                </span>
                <div className="flex items-center gap-1">
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEdgeCondition?.(eg);
                      }}
                      className={
                        hasCond
                          ? 'text-amber-800 hover:text-amber-950'
                          : isElse
                            ? 'text-slate-800 hover:text-slate-950'
                            : 'text-indigo-600 hover:text-indigo-800'
                      }
                      title={
                        hasCond
                          ? `IF: ${eg.condition.path} ${eg.condition.operator} ${eg.condition.value ?? ''}`
                          : isElse
                            ? 'ELSE (Fallback branch)'
                            : 'Add Condition / Branch'
                      }
                    >
                      {isElse ? (
                        <GitFork className="h-2.5 w-2.5" />
                      ) : (
                        <Filter className="h-2.5 w-2.5" />
                      )}
                    </button>
                  )}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEdge(eg.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                      title="Disconnect connection"
                    >
                      <Unlink className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Output Handle & Interconnect Trigger */}
      <div className="mt-2 flex items-center justify-between border-t pt-1.5 text-[10px] text-muted-foreground">
        <span className="truncate font-mono">{node.id}</span>

        {/* Connect Target Indicator / Interconnect CTA */}
        {isLinkingTargetCandidate ? (
          <Button
            size="sm"
            className="h-5 bg-indigo-600 px-2 text-[10px] font-bold text-white hover:bg-indigo-700"
            onClick={(e) => {
              e.stopPropagation();
              onConnectNodes(linkingSourceId, node.id);
            }}
          >
            Connect Here
          </Button>
        ) : (
          isEditMode &&
          node.type !== 'END' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (linkingSourceId === node.id) {
                  onSetLinkingSourceId(null);
                } else {
                  onSetLinkingSourceId(node.id);
                  toast.info(
                    `Linking mode active for ${node.id}. Click target node to connect.`,
                  );
                }
              }}
              className={`flex items-center gap-0.5 rounded px-2 py-0.5 font-bold transition-all ${
                isLinkingSource
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
              title="Click to start interconnecting from this node"
            >
              <LinkIcon className="h-2.5 w-2.5" />
              <span>{isLinkingSource ? 'Linking...' : 'Link'}</span>
            </button>
          )
        )}
      </div>

      {/* Right Output Port Handle */}
      {node.type !== 'END' && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (isEditMode) {
              onSetLinkingSourceId(node.id);
              toast.info(
                `Linking mode active for ${node.id}. Click target node to connect.`,
              );
            }
          }}
          className={`absolute -right-2.5 top-8 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-indigo-600 bg-white transition-all ${
            isEditMode
              ? 'cursor-pointer hover:scale-125 hover:bg-indigo-600'
              : ''
          }`}
          title="Output Port (Click to link to target node)"
        />
      )}
    </div>
  );
}
