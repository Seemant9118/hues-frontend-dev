'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  useWorkflowDefinitionDetail,
  useWorkflowDefinitions,
  useWorkflowMutations,
} from '@/hooks/workflows/useWorkflowBuilder';
import {
  ACTION_EVENTS,
  transformBackendGraphToCanvas,
  transformCanvasToBackendGraph,
} from '@/utils/workflowGraphTransformer';
import {
  computeCanvasWidth,
  computeSvgEdges,
  mapStudioModuleToWorkflowModule,
  sortAndPositionNodes,
} from '../utils/workflowGraphLayout';
import { findUnconnectedNodes } from '../utils/workflowGraphValidation';

export { mapStudioModuleToWorkflowModule } from '../utils/workflowGraphLayout';

export function useWorkflowCanvasGraph({
  moduleName,
  propSelectedDefId,
  propSetSelectedDefId,
  propIsEditMode,
  propSetIsEditMode,
  propIsCreatingNewFlow,
  propSetIsCreatingNewFlow,
  newWorkflowName,
}) {
  const targetModule = mapStudioModuleToWorkflowModule(moduleName);
  const isCustomWorkflow =
    targetModule === 'CUSTOM_WORKFLOW' ||
    targetModule === 'CUSTOM' ||
    String(moduleName || '')
      .toUpperCase()
      .includes('CUSTOM');

  // Definitions Query
  const { data: definitions = [], isLoading: isDefinitionsLoading } =
    useWorkflowDefinitions(targetModule);

  const [internalSelectedDefId, setInternalSelectedDefId] = useState(null);
  const selectedDefinitionId =
    propSelectedDefId !== undefined ? propSelectedDefId : internalSelectedDefId;
  const setSelectedDefinitionId =
    propSetSelectedDefId || setInternalSelectedDefId;

  const [internalEditMode, setInternalEditMode] = useState(false);
  const isEditMode =
    propIsEditMode !== undefined ? propIsEditMode : internalEditMode;
  const setIsEditMode = propSetIsEditMode || setInternalEditMode;

  const [internalCreatingNewFlow, setInternalCreatingNewFlow] = useState(false);
  const isCreatingNewFlow =
    propIsCreatingNewFlow !== undefined
      ? propIsCreatingNewFlow
      : internalCreatingNewFlow;
  const setIsCreatingNewFlow =
    propSetIsCreatingNewFlow || setInternalCreatingNewFlow;

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeForModal, setSelectedNodeForModal] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Overlay info dismiss states
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);
  const [isSuccessDismissed, setIsSuccessDismissed] = useState(false);

  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Direct Node-to-Node Linking Mode State
  const [linkingSourceId, setLinkingSourceId] = useState(null);
  const [pendingEventTarget, setPendingEventTarget] = useState(null);

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const selectedWorkflowDef = useMemo(() => {
    if (isCreatingNewFlow) {
      return {
        id: 'LOCAL_TEMP_DRAFT',
        name: newWorkflowName
          ? `${newWorkflowName} (New Draft)`
          : 'New Workflow (New Draft)',
        status: 'DRAFT',
        active: false,
        isLocalTemp: true,
      };
    }
    return definitions.find((d) => d.id === selectedDefinitionId);
  }, [definitions, selectedDefinitionId, isCreatingNewFlow, newWorkflowName]);

  // Fetch Definition Detail
  const { data: detailData, isLoading: isDetailLoading } =
    useWorkflowDefinitionDetail(
      selectedDefinitionId === 'LOCAL_TEMP_DRAFT' ? null : selectedDefinitionId,
    );

  const draftData = detailData?.draft;

  // Versions List from detailData (GET /definitions/:id)
  const versionsList = useMemo(() => {
    if (Array.isArray(detailData?.versions) && detailData.versions.length > 0) {
      return detailData.versions;
    }
    const list = [];
    if (detailData?.activeVersion) {
      list.push(detailData.activeVersion);
    }
    if (detailData?.draft) {
      list.push(detailData.draft);
    }
    return list;
  }, [detailData]);

  // Backend Active Version ID
  const activeVersionIdFromBackend = useMemo(() => {
    if (!detailData) return null;
    return (
      detailData.activeVersionId ||
      detailData.definition?.activeVersionId ||
      detailData.activeVersion?.id ||
      detailData.versions?.[0]?.id ||
      detailData.draft?.id ||
      null
    );
  }, [detailData]);

  // Track explicit manual user selection in versions dropdown
  const [manualSelectedVersionId, setManualSelectedVersionId] = useState(null);

  // Selected Version Record ID: Use manual selection if valid, otherwise fallback to active version from backend
  const selectedVersionRecordId = useMemo(() => {
    if (manualSelectedVersionId && versionsList.length > 0) {
      const exists = versionsList.some(
        (v) => String(v.id) === String(manualSelectedVersionId),
      );
      if (exists) return String(manualSelectedVersionId);
    }
    return activeVersionIdFromBackend
      ? String(activeVersionIdFromBackend)
      : versionsList[0]?.id
        ? String(versionsList[0].id)
        : null;
  }, [manualSelectedVersionId, versionsList, activeVersionIdFromBackend]);

  const setSelectedVersionRecordId = (versionId) => {
    setManualSelectedVersionId(versionId ? String(versionId) : null);
  };

  const activeVersionObj = useMemo(() => {
    if (selectedVersionRecordId && versionsList.length > 0) {
      const match = versionsList.find(
        (v) => String(v.id) === String(selectedVersionRecordId),
      );
      if (match) return match;
    }
    return detailData?.draft || detailData?.activeVersion || null;
  }, [selectedVersionRecordId, versionsList, detailData]);

  const currentGraphToRender =
    activeVersionObj?.graph || draftData?.graph || detailData?.graph;

  // Workflow Mutations
  const workflowMutations = useWorkflowMutations({
    onDraftSaved: (data) => {
      setIsDraftSaved(true);
      setHasUnsavedChanges(false);
      setManualSelectedVersionId(null);
      if (data?.valid === false) {
        setValidationErrors(data.validationErrors || ['Graph has warnings']);
      } else {
        toast.success(
          'Draft saved successfully! You can now Publish & Activate.',
        );
      }
    },
    onPublished: () => {
      setIsEditMode(false);
      setIsCreatingNewFlow(false);
      setIsDraftSaved(true);
      setHasUnsavedChanges(false);
      setManualSelectedVersionId(null);
      toast.success('Workflow published and activated successfully!');
    },
    onActivated: () => {
      setManualSelectedVersionId(null);
    },
  });

  // Activate Version Handler
  const handleActivateVersion = async (versionId) => {
    if (!selectedDefinitionId || selectedDefinitionId === 'LOCAL_TEMP_DRAFT')
      return;
    try {
      await workflowMutations.activateVersion({
        id: selectedDefinitionId,
        versionId,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to activate version:', err);
    }
  };

  // Explicitly clear canvas or initialize default template for new workflow creation
  useEffect(() => {
    if (isCreatingNewFlow) {
      if (isCustomWorkflow) {
        setNodes([]);
        setEdges([]);
        setSelectedNodeId(null);
      } else {
        const defaultStartKey = `SYSTEM_${targetModule}_START`;
        setNodes([
          {
            id: defaultStartKey,
            name: `System Start (${targetModule})`,
            type: 'SYSTEM',
            position: { x: 60, y: 80 },
            content: {
              key: defaultStartKey,
              label: `System Start (${targetModule})`,
              type: 'SYSTEM',
              start: true,
            },
          },
        ]);
        setEdges([]);
        setSelectedNodeId(defaultStartKey);
      }
      setIsValidated(false);
      setIsDraftSaved(false);
      setHasUnsavedChanges(false);
      setIsWarningDismissed(false);
      setIsSuccessDismissed(false);
    }
  }, [isCreatingNewFlow, targetModule, isCustomWorkflow]);

  // Load backend graph into visual flowchart nodes & edges STRICTLY according to backend graph schema
  useEffect(() => {
    if (isCreatingNewFlow) return;

    if (currentGraphToRender) {
      const parsed = transformBackendGraphToCanvas(currentGraphToRender);
      let initialNodes = parsed.nodes || [];
      const initialEdges = parsed.edges || [];

      // Ensure System Start node presence ONLY for system workflows
      if (!isCustomWorkflow) {
        const hasStartNode = initialNodes.some(
          (n) => n.type === 'SYSTEM' || n.content?.start,
        );

        if (!hasStartNode) {
          const defaultStartKey = `SYSTEM_${targetModule}_START`;
          const startNode = {
            id: defaultStartKey,
            name: `System Start (${targetModule})`,
            type: 'SYSTEM',
            position: { x: 60, y: 80 },
            content: {
              key: defaultStartKey,
              label: `System Start (${targetModule})`,
              type: 'SYSTEM',
              start: true,
            },
          };
          initialNodes = [startNode, ...initialNodes];
        }
      }

      // Preserve saved visual positions or perform topological sorting for clean layout
      initialNodes = sortAndPositionNodes(initialNodes, initialEdges);

      // Render strictly according to backend graph payload edges (no synthetic duplicate connections)
      setNodes(initialNodes);
      setEdges(initialEdges);
      setIsValidated(activeVersionObj?.valid !== false);
      setIsDraftSaved(true);
      setHasUnsavedChanges(false);
      setValidationErrors(activeVersionObj?.validationErrors || []);
      setIsWarningDismissed(false);
      setIsSuccessDismissed(false);
    } else if (
      !isDetailLoading &&
      selectedDefinitionId &&
      selectedDefinitionId !== 'LOCAL_TEMP_DRAFT' &&
      nodes.length === 0
    ) {
      if (isCustomWorkflow) {
        setNodes([]);
      } else {
        const defaultStartKey = `SYSTEM_${targetModule}_START`;
        setNodes([
          {
            id: defaultStartKey,
            name: `System Start (${targetModule})`,
            type: 'SYSTEM',
            position: { x: 60, y: 80 },
            content: {
              key: defaultStartKey,
              label: `System Start (${targetModule})`,
              type: 'SYSTEM',
              start: true,
            },
          },
        ]);
      }
    }
  }, [
    currentGraphToRender,
    activeVersionObj,
    isDetailLoading,
    selectedDefinitionId,
    isCreatingNewFlow,
    targetModule,
    isCustomWorkflow,
  ]);

  // Topological disconnection check (END node requires incoming connection; non-END nodes require outgoing connection; intermediate nodes require both)
  const unconnectedNodes = useMemo(
    () => findUnconnectedNodes(nodes, edges),
    [nodes, edges],
  );

  const hasUnconnectedNodes = unconnectedNodes.length > 0;

  // Check if any FORM step node lacks an associated custom form
  const formNodesWithoutSelection = useMemo(
    () =>
      nodes.filter((n) => n.type === 'FORM' && !n.content?.formConfigurationId),
    [nodes],
  );
  const hasUnselectedFormNodes = formNodesWithoutSelection.length > 0;

  // Add Step Node aligned horizontally on same line (y = 80)
  const handleAddStep = (stepTypeObj) => {
    setNodes((prevNodes) => {
      // 1. Prevent duplicate Workflow End nodes
      if (
        stepTypeObj.type === 'END' &&
        prevNodes.some((n) => n.type === 'END')
      ) {
        toast.warning('Workflow End step already exists in this workflow.');
        return prevNodes;
      }

      const endNodeIndex = prevNodes.findIndex((n) => n.type === 'END');
      const hasEndNode = endNodeIndex !== -1;

      const hasStartNode = prevNodes.some(
        (n) => n.content?.start || n.type === 'SYSTEM' || n.type === 'START',
      );
      const isFirstNonEndNode = !hasStartNode && stepTypeObj.type !== 'END';

      const newStepKey = `${stepTypeObj.type}_${prevNodes.length + 1}`;

      const newNode = {
        id: newStepKey,
        name: `${stepTypeObj.label} ${prevNodes.length + 1}`,
        type: stepTypeObj.type,
        position: { x: 60, y: 80 },
        content: {
          key: newStepKey,
          label: `${stepTypeObj.label} ${prevNodes.length + 1}`,
          type: stepTypeObj.type,
          start: stepTypeObj.isStart || isFirstNonEndNode,
          assignee:
            stepTypeObj.type === 'APPROVAL'
              ? { type: 'ROLE', roleCode: 'MANAGER' }
              : null,
          formConfigurationId: stepTypeObj.type === 'FORM' ? null : null,
          config:
            stepTypeObj.type === 'DATA_UPDATE'
              ? {
                  target: 'extraInfo.workflowRules.tdsAmount',
                  operation: 'PERCENTAGE',
                  source: 'amount',
                  percentage: 10,
                }
              : null,
        },
      };

      let updatedNodes = [...prevNodes];

      // If Workflow End exists, insert new non-END steps BEFORE Workflow End so Workflow End stays at the end
      if (hasEndNode && stepTypeObj.type !== 'END') {
        updatedNodes.splice(endNodeIndex, 0, newNode);
      } else {
        updatedNodes.push(newNode);
      }

      // Recalculate horizontal positions for pipeline layout
      updatedNodes = updatedNodes.map((n, idx) => ({
        ...n,
        position: { x: 60 + idx * 300, y: 80 },
      }));

      // Update edges: connect preceding node -> newNode -> succeeding node
      setEdges((prevEdges) => {
        let updatedEdges = [...prevEdges];

        const insertedIdx = updatedNodes.findIndex((n) => n.id === newStepKey);
        const precedingNode =
          insertedIdx > 0 ? updatedNodes[insertedIdx - 1] : null;
        const succeedingNode =
          insertedIdx < updatedNodes.length - 1
            ? updatedNodes[insertedIdx + 1]
            : null;

        // Remove old direct edge between preceding and succeeding nodes if inserting between them
        if (precedingNode && succeedingNode) {
          updatedEdges = updatedEdges.filter(
            (e) =>
              !(
                e.sourceId === precedingNode.id &&
                e.targetId === succeedingNode.id
              ),
          );
        }

        // Add edge from precedingNode -> newNode
        if (precedingNode && precedingNode.type !== 'END') {
          const availableEvents = ACTION_EVENTS[precedingNode.type] || [];
          const eventOn =
            availableEvents.length > 0 ? availableEvents[0] : 'DEFAULT';
          const exists = updatedEdges.some(
            (e) => e.sourceId === precedingNode.id && e.targetId === newStepKey,
          );
          if (!exists) {
            updatedEdges.push({
              id: `edge_${precedingNode.id}_${newStepKey}_${Date.now()}`,
              sourceId: precedingNode.id,
              targetId: newStepKey,
              type: eventOn,
              label: eventOn,
            });
          }
        }

        // Add edge from newNode -> succeedingNode (e.g., Workflow End)
        if (succeedingNode) {
          const availableEvents = ACTION_EVENTS[newNode.type] || [];
          const eventOn =
            availableEvents.length > 0 ? availableEvents[0] : 'DEFAULT';
          const exists = updatedEdges.some(
            (e) =>
              e.sourceId === newStepKey && e.targetId === succeedingNode.id,
          );
          if (!exists) {
            updatedEdges.push({
              id: `edge_${newStepKey}_${succeedingNode.id}_${Date.now() + 1}`,
              sourceId: newStepKey,
              targetId: succeedingNode.id,
              type: eventOn,
              label: eventOn,
            });
          }
        }

        return updatedEdges;
      });

      setSelectedNodeId(newStepKey);
      setIsValidated(false);
      setIsDraftSaved(false);
      setHasUnsavedChanges(true);
      setIsWarningDismissed(false);

      return updatedNodes;
    });
  };

  // Update Node Form Association (Real-Time Synchronized for both Canvas & Modal)
  const handleUpdateNodeForm = (nodeId, formConfigId, customFormName) => {
    const updatedFormId = formConfigId ? Number(formConfigId) : null;
    const updatedName = customFormName
      ? `Custom Form: ${customFormName}`
      : `Custom Form ${formConfigId || ''}`;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          name: updatedName,
          content: {
            ...n.content,
            formConfigurationId: updatedFormId,
          },
        };
      }),
    );

    // Update active modal node state in real-time
    setSelectedNodeForModal((prev) => {
      if (!prev || prev.id !== nodeId) return prev;
      return {
        ...prev,
        name: updatedName,
        content: {
          ...prev.content,
          formConfigurationId: updatedFormId,
        },
      };
    });

    setHasUnsavedChanges(true);
    setIsDraftSaved(false);
    setIsValidated(false);
    toast.success(
      `Associated form updated to "${customFormName || 'System Default'}"`,
    );
  };

  // Update Data Update Node Configuration (Target, Source, Operation, Percentage/FixedValue)
  const handleUpdateNodeDataConfig = (
    nodeId,
    dataConfig,
    showToast = false,
  ) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          content: {
            ...n.content,
            config: dataConfig,
          },
        };
      }),
    );

    setSelectedNodeForModal((prev) => {
      if (!prev || prev.id !== nodeId) return prev;
      return {
        ...prev,
        content: {
          ...prev.content,
          config: dataConfig,
        },
      };
    });

    setHasUnsavedChanges(true);
    setIsDraftSaved(false);
    setIsValidated(false);
    if (showToast) {
      toast.success('Configuration saved.');
    }
  };

  // Update Edge Transition Condition (IF condition or ELSE fallback)
  const handleUpdateEdgeCondition = (edgeId, condition, isElse = false) => {
    setEdges((prev) =>
      prev.map((e) => {
        if (e.id !== edgeId) return e;
        return {
          ...e,
          condition: condition || null,
          isElse: Boolean(isElse),
        };
      }),
    );

    setHasUnsavedChanges(true);
    setIsDraftSaved(false);
    setIsValidated(false);
    if (condition) {
      toast.success('IF condition updated successfully.');
    } else if (isElse) {
      toast.success('Transition configured as ELSE (Fallback) path.');
    } else {
      toast.info('Transition condition cleared.');
    }
  };

  // Helper: Auto-connect disconnected nodes to the nearest available open step
  const handleAutoConnectUnconnected = () => {
    if (unconnectedNodes.length === 0) return;

    setEdges((prevEdges) => {
      const updatedEdges = [...prevEdges];

      unconnectedNodes.forEach((targetUnconnected) => {
        const potentialSource = nodes.find(
          (n) =>
            n.id !== targetUnconnected.id &&
            n.type !== 'END' &&
            !updatedEdges.some(
              (e) => e.sourceId === n.id && e.targetId === targetUnconnected.id,
            ),
        );

        if (potentialSource) {
          const availableEvents = ACTION_EVENTS[potentialSource.type] || [];
          const eventOn =
            availableEvents.length > 0 ? availableEvents[0] : 'DEFAULT';

          updatedEdges.push({
            id: `edge_${potentialSource.id}_${targetUnconnected.id}_${Date.now()}`,
            sourceId: potentialSource.id,
            targetId: targetUnconnected.id,
            type: eventOn,
            label: eventOn,
          });
        }
      });

      return updatedEdges;
    });

    toast.success('Auto-connected disconnected nodes!');
    setIsValidated(false);
    setIsDraftSaved(false);
    setHasUnsavedChanges(true);
  };

  // Delete Step Node
  const handleDeleteNode = (nodeId) => {
    const nodeToDelete = nodes.find((n) => n.id === nodeId);
    if (
      !isCustomWorkflow &&
      nodeToDelete &&
      (nodeToDelete.type === 'SYSTEM' || nodeToDelete.content?.start)
    ) {
      toast.error('System Start step cannot be deleted.');
      return;
    }

    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) =>
      prev.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId),
    );
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (linkingSourceId === nodeId) setLinkingSourceId(null);
    setIsValidated(false);
    setIsDraftSaved(false);
    setHasUnsavedChanges(true);
  };

  // Direct Node-to-Node Interconnect Handler
  const handleConnectNodes = (sourceId, targetId, eventType = null) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const sourceNode = nodes.find((n) => n.id === sourceId);
    if (sourceNode?.type === 'END') {
      toast.error(
        'Workflow End is the final step and cannot have outgoing connections.',
      );
      setLinkingSourceId(null);
      return;
    }

    const availableEvents = ACTION_EVENTS[sourceNode?.type] || [];

    if (!eventType && availableEvents.length > 1) {
      setPendingEventTarget({ sourceId, targetId, availableEvents });
      return;
    }

    const finalEvent =
      eventType ||
      (availableEvents.length > 0 ? availableEvents[0] : 'DEFAULT');

    const exists = edges.some(
      (e) =>
        e.sourceId === sourceId &&
        e.targetId === targetId &&
        e.type === finalEvent,
    );

    if (exists) {
      toast.warning(
        `Connection (${finalEvent}) already exists between ${sourceId} and ${targetId}.`,
      );
      setLinkingSourceId(null);
      return;
    }

    setEdges((prev) => [
      ...prev,
      {
        id: `edge_${sourceId}_${targetId}_${Date.now()}`,
        sourceId,
        targetId,
        type: finalEvent,
        label: finalEvent,
      },
    ]);

    setLinkingSourceId(null);
    setPendingEventTarget(null);
    setIsValidated(false);
    setIsDraftSaved(false);
    setHasUnsavedChanges(true);
    setIsWarningDismissed(false);
    toast.success(`Interconnected ${sourceId} ➔ ${targetId} (${finalEvent})`);
  };

  // Disconnect Edge Transition
  const handleDeleteEdge = (edgeId) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setIsValidated(false);
    setIsDraftSaved(false);
    setHasUnsavedChanges(true);
    toast.info('Disconnected node transition.');
  };

  // Archive Workflow Handler
  const handleArchiveWorkflow = async () => {
    if (!selectedDefinitionId || selectedDefinitionId === 'LOCAL_TEMP_DRAFT')
      return;
    try {
      await workflowMutations.archiveDefinition({ id: selectedDefinitionId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Archive workflow failed:', err);
    }
  };

  // Unarchive Workflow Handler
  const handleUnarchiveWorkflow = async () => {
    if (!selectedDefinitionId || selectedDefinitionId === 'LOCAL_TEMP_DRAFT')
      return;
    try {
      await workflowMutations.unarchiveDefinition({ id: selectedDefinitionId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Unarchive workflow failed:', err);
    }
  };

  // Dragging nodes on flowchart canvas
  const handleNodeMouseDown = (e, nodeId) => {
    if (!isEditMode) return;
    e.stopPropagation();

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y,
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!draggingNodeId || !isEditMode) return;

    const newX = Math.max(10, e.clientX - dragOffset.x);
    const newY = Math.max(10, e.clientY - dragOffset.y);

    setNodes((prev) =>
      prev.map((n) =>
        n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n,
      ),
    );
    setHasUnsavedChanges(true);
    setIsDraftSaved(false);
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  // Validate Flow Graph (Step 1 CTA)
  const handleValidateGraph = async () => {
    const hasEndNode = nodes.some((n) => n.type === 'END');
    if (!hasEndNode) {
      toast.error(
        'Workflow topology must include and terminate with a "Workflow End" step!',
      );
      setIsValidated(false);
      return;
    }

    if (hasUnconnectedNodes || nodes.length < 2) {
      const unconnectedNames = unconnectedNodes.map((n) => n.name).join(', ');
      toast.error(
        unconnectedNames
          ? `Cannot validate graph! Disconnected nodes found: ${unconnectedNames}`
          : 'Cannot validate graph! All steps must be connected to a "Workflow End" step.',
      );
      setIsValidated(false);
      return;
    }

    if (hasUnselectedFormNodes) {
      const names = formNodesWithoutSelection
        .map((n) => n.name || n.id)
        .join(', ');
      toast.error(
        `Form selection required! Please select a custom form for step(s): ${names}`,
      );
      setIsValidated(false);
      return;
    }

    if (selectedDefinitionId && selectedDefinitionId !== 'LOCAL_TEMP_DRAFT') {
      const res = await workflowMutations.validateDraft({
        id: selectedDefinitionId,
      });
      const data = res?.data?.data || res;
      if (data?.valid !== false) {
        setIsValidated(true);
        setValidationErrors([]);
        setIsSuccessDismissed(false);
        toast.success(
          'Workflow topology is valid! Click "Save Draft" to persist changes.',
        );
      } else {
        setIsValidated(false);
        setValidationErrors(
          data?.validationErrors || ['Graph validation failed'],
        );
      }
    } else {
      setIsValidated(true);
      setIsSuccessDismissed(false);
      toast.success(
        'Workflow topology is fully connected! Click "Save Draft" to persist changes.',
      );
    }
  };

  // Save Draft (Step 2 CTA - Creates backend definition if local temp, removes local entry, refetches API)
  const handleSaveDraft = async () => {
    if (!isValidated) {
      toast.error(
        'Please validate the workflow topology first by clicking "Validate Workflow".',
      );
      return;
    }

    const graphPayload = transformCanvasToBackendGraph({
      nodes,
      edges,
      moduleName: targetModule,
      triggerType: isCustomWorkflow ? 'MANUAL_START' : 'RECORD_CREATED',
    });

    if (isCreatingNewFlow || selectedDefinitionId === 'LOCAL_TEMP_DRAFT') {
      const newDefRes = await workflowMutations.createDefinition({
        data: {
          name:
            newWorkflowName ||
            `${targetModule} Workflow ${Date.now().toString().slice(-4)}`,
          module: targetModule,
        },
      });
      const newId = newDefRes?.data?.data?.id;
      if (newId) {
        setManualSelectedVersionId(null);
        await workflowMutations.saveDraft({ id: newId, graph: graphPayload });
        setIsCreatingNewFlow(false);
        setSelectedDefinitionId(newId);

        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('definitionId', String(newId));
          url.searchParams.delete('create');
          url.searchParams.delete('name');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } else if (selectedDefinitionId) {
      setManualSelectedVersionId(null);
      await workflowMutations.saveDraft({
        id: selectedDefinitionId,
        graph: graphPayload,
      });
    }
  };

  // Publish & Activate (Step 3 CTA - Requires Draft to be saved first!)
  const handlePublishGraph = async () => {
    if (hasUnsavedChanges || !isDraftSaved) {
      toast.error(
        'Unsaved visual changes detected! Please click "Save Draft" before publishing & activating.',
      );
      return;
    }
    if (!selectedDefinitionId || selectedDefinitionId === 'LOCAL_TEMP_DRAFT') {
      toast.error('Please save draft first before publishing.');
      return;
    }
    await workflowMutations.publishDefinition({
      id: selectedDefinitionId,
      activate: true,
    });
  };

  // SVG Bezier paths for edge transitions
  const svgEdges = useMemo(() => computeSvgEdges(nodes, edges), [nodes, edges]);

  // Dynamic canvas width
  const canvasWidth = useMemo(() => computeCanvasWidth(nodes), [nodes]);

  return {
    targetModule,
    isCustomWorkflow,
    definitions,
    detailData,
    isDefinitionsLoading,
    isDetailLoading,
    selectedDefinitionId,
    setSelectedDefinitionId,
    selectedWorkflowDef,
    isEditMode,
    setIsEditMode,
    isCreatingNewFlow,
    setIsCreatingNewFlow,
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
    validationErrors,
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
    activeVersionId: activeVersionIdFromBackend,
    activeVersionObj,
    handleActivateVersion,
    isActivatingVersion: workflowMutations.isActivating,
    isUnarchiving: workflowMutations.isUnarchiving,
    handleNodeMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleValidateGraph,
    handleSaveDraft,
    handlePublishGraph,
  };
}
