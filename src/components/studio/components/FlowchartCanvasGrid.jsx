'use client';

import React from 'react';
import { Filter, GitFork, X } from 'lucide-react';
import FlowchartNodeCard from './FlowchartNodeCard';

export default function FlowchartCanvasGrid({
  canvasRef,
  isEditMode,
  canvasWidth,
  svgEdges,
  nodes,
  edges,
  selectedNodeId,
  unconnectedNodes,
  linkingSourceId,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onNodeMouseDown,
  onSelectNode,
  onConnectNodes,
  onInspectNode,
  onDeleteNode,
  onDeleteEdge,
  onEditEdgeCondition,
  onSetLinkingSourceId,
}) {
  return (
    <div
      ref={canvasRef}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
      onMouseLeave={onCanvasMouseUp}
      className={`${
        isEditMode ? 'col-span-9' : 'col-span-12'
      } bg-grid-pattern relative h-[440px] select-none overflow-x-auto overflow-y-hidden rounded-lg border p-4`}
      style={{
        backgroundImage:
          'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div style={{ width: canvasWidth, height: '100%', position: 'relative' }}>
        {/* SVG Render Layer for Interconnection Bezier Edges */}
        <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full">
          <defs>
            <marker
              id="flow-arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
          {svgEdges.map((edge) => (
            <g key={edge.id}>
              <path
                d={edge.pathD}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeDasharray={edge.type === 'DEFAULT' ? '0' : '5,5'}
                markerEnd="url(#flow-arrowhead)"
              />
            </g>
          ))}
        </svg>

        {/* Interactive Edge Badges positioned cleanly above straight transition lines */}
        {svgEdges.map((edge) => {
          const hasCondition = Boolean(edge.condition && edge.condition.path);
          const hasSiblingWithCondition = svgEdges.some(
            (other) =>
              other.sourceId === edge.sourceId &&
              (other.type || other.on) === (edge.type || edge.on) &&
              Boolean(other.condition && other.condition.path),
          );
          const isElse =
            edge.isElse || (!hasCondition && hasSiblingWithCondition);

          const condText = hasCondition
            ? `IF: ${edge.condition.path} ${edge.condition.operator} ${
                edge.condition.value !== undefined
                  ? Array.isArray(edge.condition.value)
                    ? edge.condition.value.join(',')
                    : edge.condition.value
                  : ''
              }`.trim()
            : isElse
              ? 'ELSE'
              : '';

          return (
            <div
              key={`badge_${edge.id}`}
              style={{
                position: 'absolute',
                left: `${edge.midX}px`,
                top: `${edge.midY}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`z-20 flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold shadow-md transition-all hover:scale-105 ${
                hasCondition
                  ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-300/50'
                  : isElse
                    ? 'border-slate-400 bg-slate-100 text-slate-900 ring-2 ring-slate-300/50'
                    : 'border-indigo-300 bg-white text-indigo-700'
              }`}
            >
              <span>{edge.type || 'DEFAULT'}</span>

              {hasCondition ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditMode) onEditEdgeCondition?.(edge);
                  }}
                  className="flex items-center gap-1 rounded bg-amber-200/70 px-1.5 py-0.5 text-[9px] text-amber-950 hover:bg-amber-300"
                  title={`Condition: ${condText}`}
                >
                  <Filter className="h-2.5 w-2.5 text-amber-700" />
                  <span className="max-w-[140px] truncate">{condText}</span>
                </button>
              ) : isElse ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditMode) onEditEdgeCondition?.(edge);
                  }}
                  className="flex items-center gap-1 rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-950 hover:bg-slate-300"
                  title="ELSE / Fallback path when IF condition fails"
                >
                  <GitFork className="h-2.5 w-2.5 text-slate-700" />
                  <span>ELSE</span>
                </button>
              ) : (
                isEditMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEdgeCondition?.(edge);
                    }}
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-800"
                    title="Add Execution Condition / Branch"
                  >
                    <Filter className="h-2.5 w-2.5" />
                  </button>
                )
              )}

              {isEditMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEdge(edge.id);
                  }}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800"
                  title={`Disconnect ${edge.sourceId} ➔ ${edge.targetId}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Straight Horizontal Line Flowchart Step Nodes (A -> B -> C -> D) */}
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isUnconnected = unconnectedNodes.some(
            (un) => un.id === node.id,
          );
          const isLinkingSource = linkingSourceId === node.id;
          const isLinkingTargetCandidate =
            linkingSourceId && linkingSourceId !== node.id;
          const outgoingEdges = edges.filter((e) => e.sourceId === node.id);

          return (
            <FlowchartNodeCard
              key={node.id}
              node={node}
              isSelected={isSelected}
              isUnconnected={isUnconnected}
              isLinkingSource={isLinkingSource}
              isLinkingTargetCandidate={isLinkingTargetCandidate}
              linkingSourceId={linkingSourceId}
              outgoingEdges={outgoingEdges}
              isEditMode={isEditMode}
              onNodeMouseDown={onNodeMouseDown}
              onSelectNode={onSelectNode}
              onConnectNodes={onConnectNodes}
              onInspectNode={onInspectNode}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              onEditEdgeCondition={onEditEdgeCondition}
              onSetLinkingSourceId={onSetLinkingSourceId}
            />
          );
        })}
      </div>
    </div>
  );
}
