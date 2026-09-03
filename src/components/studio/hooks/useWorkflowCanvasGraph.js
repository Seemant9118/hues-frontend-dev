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

export function mapStudioModuleToWorkflowModule(moduleName = '') {
  const upper = String(moduleName || '').toUpperCase();
  if (
    upper.includes('INVOICE') ||
    upper.includes('B2C') ||
    upper.includes('B2B')
  ) {
    return 'INVOICE';
  }
  if (upper.includes('PAYMENT')) {
    return 'PAYMENT';
  }
  if (
    upper.includes('PURCHASE') ||
    upper.includes('SALES') ||
    upper.includes('ORDER')
  ) {
    return 'ORDER';
  }
  return 'ORDER';
}

const NODE_WIDTH = 220;

function sortAndPositionNodes(nodes = [], edges = []) {
  if (nodes.length === 0) return [];

  // Check if nodes already have preserved visual coordinates
  const hasSavedPositions = nodes.some(
    (n) => n.position && typeof n.position.x === 'number' && n.position.x > 0,
  );

  if (hasSavedPositions) {
    // Preserve existing visual position coordinates and sort by x position ascending
    return [...nodes].sort(
      (a, b) => (a.position?.x || 0) - (b.position?.x || 0),
    );
  }

  // Topological sorting when no visual coordinates exist
  const inDegree = {};
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
  });

  edges.forEach((e) => {
    if (inDegree[e.targetId] !== undefined) {
      inDegree[e.targetId] += 1;
    }
  });

  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const orderedIds = [];
  const visited = new Set();

  while (queue.length > 0) {
    const currId = queue.shift();
    if (!visited.has(currId)) {
      visited.add(currId);
      orderedIds.push(currId);

      const outgoing = edges.filter((e) => e.sourceId === currId);
      outgoing.forEach((e) => {
        if (inDegree[e.targetId] !== undefined) {
          inDegree[e.targetId] -= 1;
          if (inDegree[e.targetId] <= 0 && !visited.has(e.targetId)) {
            queue.push(e.targetId);
          }
        }
      });
    }
  }

  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      orderedIds.push(n.id);
    }
  });

  return orderedIds
    .map((id, idx) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return null;
      return {
        ...node,
        position: {
          x: 60 + idx * 300,
          y: node.position?.y || 80,
        },
      };
    })
    .filter(Boolean);
}

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

  // Workflow Mutations
  const workflowMutations = useWorkflowMutations({
    onDraftSaved: (data) => {
      setIsDraftSaved(true);
      setHasUnsavedChanges(false);
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
      toast.success('Workflow published and activated successfully!');
    },
  });

  // Explicitly clear canvas to System Start ONLY when building new workflow
  useEffect(() => {
    if (isCreatingNewFlow) {
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
      setIsValidated(false);
      setIsDraftSaved(false);
      setHasUnsavedChanges(false);
      setIsWarningDismissed(false);
      setIsSuccessDismissed(false);
    }
  }, [isCreatingNewFlow, targetModule]);

  // Load backend graph into visual flowchart nodes & edges STRICTLY according to backend graph schema
  useEffect(() => {
    if (isCreatingNewFlow) return;

    if (draftData?.graph) {
      const parsed = transformBackendGraphToCanvas(draftData.graph);
      let initialNodes = parsed.nodes || [];
      const initialEdges = parsed.edges || [];

      // Ensure System Start node presence
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

      // Preserve saved visual positions or perform topological sorting for clean layout
      initialNodes = sortAndPositionNodes(initialNodes, initialEdges);

      // Render strictly according to backend graph payload edges (no synthetic duplicate connections)
      setNodes(initialNodes);
      setEdges(initialEdges);
      setIsValidated(draftData.valid !== false);
      setIsDraftSaved(true);
      setHasUnsavedChanges(false);
      setValidationErrors(draftData.validationErrors || []);
      setIsWarningDismissed(false);
      setIsSuccessDismissed(false);
    } else if (
      !isDetailLoading &&
      selectedDefinitionId &&
      selectedDefinitionId !== 'LOCAL_TEMP_DRAFT' &&
      nodes.length === 0
    ) {
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
  }, [
    draftData,
    isDetailLoading,
    selectedDefinitionId,
    isCreatingNewFlow,
    targetModule,
  ]);

  // Topological disconnection check (END node requires incoming connection; non-END nodes require outgoing connection)
  const unconnectedNodes = useMemo(() => {
    if (nodes.length <= 1) return [];

    return nodes.filter((node) => {
      const isEnd = node.type === 'END';

      const hasOutgoing = edges.some((e) => e.sourceId === node.id);
      const hasIncoming = edges.some((e) => e.targetId === node.id);

      if (isEnd) return !hasIncoming;
      return !hasOutgoing;
    });
  }, [nodes, edges]);

  const hasUnconnectedNodes = unconnectedNodes.length > 0;

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
          start: stepTypeObj.isStart || false,
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
      toast.success(`Workflow "${selectedWorkflowDef?.name || ''}" archived.`);
    } catch (err) {
      toast.error('Failed to archive workflow.');
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
    if (!hasEndNode && nodes.length > 1) {
      toast.error(
        'Workflow topology must terminate with a "Workflow End" step!',
      );
      setIsValidated(false);
      return;
    }

    if (hasUnconnectedNodes) {
      toast.error('Cannot validate graph with disconnected nodes!');
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
      triggerType: 'RECORD_CREATED',
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
      if (newDefRes?.data?.data?.id) {
        const newId = newDefRes.data.data.id;
        setIsCreatingNewFlow(false);
        setSelectedDefinitionId(newId);
        await workflowMutations.saveDraft({ id: newId, graph: graphPayload });
      }
    } else if (selectedDefinitionId) {
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
  const svgEdges = useMemo(() => {
    return edges
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.sourceId);
        const targetNode = nodes.find((n) => n.id === edge.targetId);

        if (!sourceNode || !targetNode) return null;

        const x1 = sourceNode.position.x + NODE_WIDTH;
        const y1 = sourceNode.position.y + 40;
        const x2 = targetNode.position.x;
        const y2 = targetNode.position.y + 40;

        const slotDistance = Math.round((x2 - x1) / 300);
        let pathD = '';
        const midX = (x1 + x2) / 2;
        let midY = (y1 + y2) / 2 - 20;

        if (slotDistance > 1) {
          const arcHeight = Math.min(100, 30 + (slotDistance - 1) * 35);
          const controlY = y1 - arcHeight;
          pathD = `M ${x1} ${y1} Q ${midX} ${controlY}, ${x2} ${y2}`;
          midY = controlY + 15;
        } else {
          const dx = Math.abs(x2 - x1) / 2;
          pathD = `M ${x1} ${y1} C ${x1 + Math.max(dx, 30)} ${y1}, ${x2 - Math.max(dx, 30)} ${y2}, ${x2} ${y2}`;
        }

        return {
          ...edge,
          pathD,
          midX,
          midY,
          x1,
          y1,
          x2,
          y2,
          sourceName: sourceNode.name,
          targetName: targetNode.name,
        };
      })
      .filter(Boolean);
  }, [nodes, edges]);

  // Dynamic canvas width
  const canvasWidth = useMemo(() => {
    if (nodes.length === 0) return '100%';
    const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH + 100));
    return `${Math.max(1000, maxX)}px`;
  }, [nodes]);

  return {
    targetModule,
    definitions,
    detailData,
    isDefinitionsLoading,
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
    handleNodeMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleValidateGraph,
    handleSaveDraft,
    handlePublishGraph,
  };
}
