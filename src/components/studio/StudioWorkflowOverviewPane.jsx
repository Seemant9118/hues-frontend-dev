'use client';

import React from 'react';
import StudioActionHeaderControls from '@/app/[locale]/(dashboard)/dashboard/studio/_details/components/StudioActionHeaderControls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Sparkles } from 'lucide-react';
import { transformCanvasToBackendGraph } from '@/utils/workflowGraphTransformer';
import CanvasOverlayCards from './components/CanvasOverlayCards';
import CanvasToolbarHeader from './components/CanvasToolbarHeader';
import EdgeConditionModal from './components/EdgeConditionModal';
import EventSelectionModal from './components/EventSelectionModal';
import FlowchartCanvasGrid from './components/FlowchartCanvasGrid';
import StepPaletteSidebar from './components/StepPaletteSidebar';
import WorkflowJsonViewModal from './components/WorkflowJsonViewModal';
import { useWorkflowCanvasGraph } from './hooks/useWorkflowCanvasGraph';
import NodeDetailsModal from './NodeDetailsModal';

export { mapStudioModuleToWorkflowModule } from './hooks/useWorkflowCanvasGraph';
export { getWorkflowStatusBadge } from './utils/workflowBadges';

export default function StudioWorkflowOverviewPane({
  moduleName,
  selectedDefinitionId,
  setSelectedDefinitionId,
  isEditMode,
  setIsEditMode,
  isCreatingNewFlow,
  setIsCreatingNewFlow,
  newWorkflowName,
  onCancelNewWorkflow,
}) {
  const [selectedEdgeForConditionModal, setSelectedEdgeForConditionModal] =
    React.useState(null);
  const [isJsonViewModalOpen, setIsJsonViewModalOpen] = React.useState(false);

  const {
    targetModule,
    isCustomWorkflow,
    selectedWorkflowDef,
    detailData,
    isDetailLoading,
    nodes,
    edges,
    selectedNodeId,
    setSelectedNodeId,
    selectedNodeForModal,
    setSelectedNodeForModal,
    unconnectedNodes,
    hasUnconnectedNodes,
    isWarningDismissed,
    setIsWarningDismissed,
    isSuccessDismissed,
    setIsSuccessDismissed,
    isValidated,
    isDraftSaved,
    hasUnsavedChanges,
    linkingSourceId,
    setLinkingSourceId,
    pendingEventTarget,
    setPendingEventTarget,
    canvasRef,
    svgEdges,
    canvasWidth,
    workflowMutations,
    graphConfig,
    handleUpdateGraphConfig,
    handleAddStep,
    handleUpdateNodeForm,
    handleUpdateNodeDataConfig,
    handleUpdateEdgeCondition,
    handleAutoConnectUnconnected,
    handleDeleteNode,
    handleConnectNodes,
    handleDeleteEdge,
    handleArchiveWorkflow,
    handleUnarchiveWorkflow,
    formNodesWithoutSelection,
    hasUnselectedFormNodes,
    versionsList,
    selectedVersionRecordId,
    setSelectedVersionRecordId,
    activeVersionId,
    handleActivateVersion,
    isActivatingVersion,
    handleNodeMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleValidateGraph,
    handleSaveDraft,
    handlePublishGraph,
  } = useWorkflowCanvasGraph({
    moduleName,
    propSelectedDefId: selectedDefinitionId,
    propSetSelectedDefId: setSelectedDefinitionId,
    propIsEditMode: isEditMode,
    propSetIsEditMode: setIsEditMode,
    propIsCreatingNewFlow: isCreatingNewFlow,
    propSetIsCreatingNewFlow: setIsCreatingNewFlow,
    newWorkflowName,
    onCancelNewWorkflow,
  });

  const workflowJson = React.useMemo(() => {
    if (detailData?.activeVersion) {
      return detailData.activeVersion;
    }
    if (detailData?.draft) {
      return detailData.draft;
    }
    if (detailData && (detailData.graph || detailData.id)) {
      return detailData;
    }

    const currentGraph = transformCanvasToBackendGraph({
      nodes,
      edges,
      moduleName: targetModule,
      graphConfig,
    });
    return {
      id: selectedWorkflowDef?.id || 'DRAFT',
      workflowDefinitionId: selectedWorkflowDef?.id || 'DRAFT',
      version: selectedWorkflowDef?.version || 1,
      status: selectedWorkflowDef?.status || 'DRAFT',
      graph: currentGraph,
    };
  }, [detailData, selectedWorkflowDef, targetModule, nodes, edges]);

  const isFullyConnected =
    !hasUnconnectedNodes && !hasUnselectedFormNodes && nodes.length >= 2;

  return (
    <div className="space-y-4">
      {/* Action Header Controls (Versions Dropdown, Activate, Editable Mode) */}
      <div className="flex w-full items-center justify-end gap-2 pb-1">
        <StudioActionHeaderControls
          selectedVersionId={selectedVersionRecordId}
          onSelectVersion={setSelectedVersionRecordId}
          activeVersionId={activeVersionId}
          isVersionsLoading={isDetailLoading}
          versions={versionsList}
          onActivateVersion={handleActivateVersion}
          isActivatingVersion={isActivatingVersion}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
        />
      </div>

      {/* Linking Active Notification Banner */}
      {linkingSourceId && (
        <div className="flex animate-pulse items-center justify-between rounded-lg border border-indigo-300 bg-indigo-50 p-3 text-xs text-indigo-900 shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            <LinkIcon className="h-4 w-4 text-indigo-600" />
            <span>
              Interconnection Mode Active: Click on any target node to connect
              from{' '}
              <span className="font-mono text-indigo-950 underline">
                {linkingSourceId}
              </span>
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 border-indigo-300 text-xs hover:bg-indigo-100"
            onClick={() => setLinkingSourceId(null)}
          >
            Cancel Linking
          </Button>
        </div>
      )}

      {/* Building New Workflow Banner */}
      {isCreatingNewFlow && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>
              <strong>New Flow Canvas ({newWorkflowName || 'Draft'}):</strong>{' '}
              {isCustomWorkflow
                ? 'Blank pane initialized for custom workflow. Add custom form steps to start.'
                : `Canvas reset to System Start node for system module ${targetModule}.`}
            </span>
          </div>
          <Badge className="bg-blue-600 text-[10px] text-white">New Flow</Badge>
        </div>
      )}

      {/* Flowchart Canvas Area */}
      <div
        className={`relative flex flex-col rounded-xl transition-all duration-300 ${
          hasUnconnectedNodes
            ? 'border-2 border-red-500 bg-red-50/10 shadow-lg shadow-red-100/50 ring-2 ring-red-500/20'
            : hasUnselectedFormNodes
              ? 'border-2 border-amber-500 bg-amber-50/10 shadow-lg shadow-amber-100/50 ring-2 ring-amber-500/20'
              : isFullyConnected || isValidated
                ? 'border-2 border-emerald-500 bg-emerald-50/10 shadow-lg shadow-emerald-100/50 ring-2 ring-emerald-500/20'
                : 'border border-neutral-200 bg-neutral-50/50'
        }`}
        style={{ minHeight: '480px' }}
      >
        {/* Floating Bottom-Right Warning and Success Cards */}
        <CanvasOverlayCards
          hasUnconnectedNodes={hasUnconnectedNodes}
          unconnectedNodes={unconnectedNodes}
          hasUnselectedFormNodes={hasUnselectedFormNodes}
          formNodesWithoutSelection={formNodesWithoutSelection}
          isWarningDismissed={isWarningDismissed}
          onDismissWarning={() => setIsWarningDismissed(true)}
          onAutoConnectUnconnected={handleAutoConnectUnconnected}
          isValidated={isValidated}
          isSuccessDismissed={isSuccessDismissed}
          onDismissSuccess={() => setIsSuccessDismissed(true)}
          isDraftSaved={isDraftSaved}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Toolbar Header Inside Canvas */}
        <CanvasToolbarHeader
          isEditMode={isEditMode}
          isCreatingNewFlow={isCreatingNewFlow}
          newWorkflowName={newWorkflowName}
          selectedWorkflowDef={selectedWorkflowDef}
          targetModule={targetModule}
          graphConfig={graphConfig}
          onUpdateGraphConfig={handleUpdateGraphConfig}
          nodesCount={nodes.length}
          edgesCount={edges.length}
          selectedDefinitionId={selectedDefinitionId}
          onOpenJsonViewModal={() => setIsJsonViewModalOpen(true)}
          isArchiving={workflowMutations.isArchiving}
          onArchiveWorkflow={handleArchiveWorkflow}
          isUnarchiving={workflowMutations.isUnarchiving}
          onUnarchiveWorkflow={handleUnarchiveWorkflow}
          isValidating={workflowMutations.isValidating}
          hasUnconnectedNodes={hasUnconnectedNodes}
          onValidateGraph={handleValidateGraph}
          isSavingDraft={workflowMutations.isSavingDraft}
          isValidated={isValidated}
          onSaveDraft={handleSaveDraft}
          isPublishing={workflowMutations.isPublishing}
          isDraftSaved={isDraftSaved}
          hasUnsavedChanges={hasUnsavedChanges}
          onPublishGraph={handlePublishGraph}
          onCancelNewWorkflow={onCancelNewWorkflow}
        />

        {/* Main Flowchart Viewport Container */}
        <div className="grid flex-1 grid-cols-12 gap-3 overflow-hidden p-3">
          {/* Step Palette (Editable Mode) */}
          {isEditMode && (
            <StepPaletteSidebar
              onAddStep={handleAddStep}
              isCustomWorkflow={isCustomWorkflow}
            />
          )}

          {/* 2D Flowchart Canvas Grid */}
          <FlowchartCanvasGrid
            canvasRef={canvasRef}
            isEditMode={isEditMode}
            canvasWidth={canvasWidth}
            svgEdges={svgEdges}
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            unconnectedNodes={unconnectedNodes}
            linkingSourceId={linkingSourceId}
            onCanvasMouseMove={handleCanvasMouseMove}
            onCanvasMouseUp={handleCanvasMouseUp}
            onNodeMouseDown={handleNodeMouseDown}
            onSelectNode={setSelectedNodeId}
            onConnectNodes={handleConnectNodes}
            onInspectNode={setSelectedNodeForModal}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={handleDeleteEdge}
            onEditEdgeCondition={(edge) =>
              setSelectedEdgeForConditionModal(edge)
            }
            onSetLinkingSourceId={setLinkingSourceId}
          />
        </div>
      </div>

      {/* Node Details & Form Association Inspection Modal */}
      <NodeDetailsModal
        isOpen={Boolean(selectedNodeForModal)}
        onClose={() => setSelectedNodeForModal(null)}
        node={selectedNodeForModal}
        nodes={nodes}
        edges={edges}
        moduleName={moduleName}
        onUpdateNodeForm={handleUpdateNodeForm}
        onUpdateNodeDataConfig={handleUpdateNodeDataConfig}
      />

      {/* Edge Transition Condition Configuration Modal */}
      <EdgeConditionModal
        isOpen={Boolean(selectedEdgeForConditionModal)}
        onClose={() => setSelectedEdgeForConditionModal(null)}
        edge={selectedEdgeForConditionModal}
        moduleName={moduleName}
        definitionId={selectedDefinitionId}
        onSaveCondition={handleUpdateEdgeCondition}
      />

      {/* Event Selection Dialog for Multi-Event Steps (APPROVAL -> APPROVED/REJECTED) */}
      <EventSelectionModal
        pendingEventTarget={pendingEventTarget}
        onClose={() => setPendingEventTarget(null)}
        onConnectNodes={handleConnectNodes}
      />

      {/* Workflow JSON View Architecture Modal */}
      <WorkflowJsonViewModal
        isOpen={isJsonViewModalOpen}
        onClose={() => setIsJsonViewModalOpen(false)}
        workflowJson={workflowJson}
      />
    </div>
  );
}
