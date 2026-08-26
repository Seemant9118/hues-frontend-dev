'use client';

import React from 'react';
import { X } from 'lucide-react';
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
        {svgEdges.map((edge) => (
          <div
            key={`badge_${edge.id}`}
            style={{
              position: 'absolute',
              left: `${edge.midX}px`,
              top: `${edge.midY}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="z-20 flex items-center gap-1.5 rounded-full border border-indigo-300 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-indigo-700 shadow-md transition-all hover:scale-105"
          >
            <span>{edge.type || 'DEFAULT'}</span>
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
        ))}

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
              onSetLinkingSourceId={onSetLinkingSourceId}
            />
          );
        })}
      </div>
    </div>
  );
}
