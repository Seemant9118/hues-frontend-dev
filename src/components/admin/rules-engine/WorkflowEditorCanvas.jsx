'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkflowDefinitionDetail } from '@/hooks/workflows/useWorkflowBuilder';
import { getAllCustomForms } from '@/services/Custom_Form_Services/CustomFormServices';
import { getRoles } from '@/services/Roles_Services/Roles_Services';
import {
  ACTION_EVENTS,
  STEP_TYPES,
  transformBackendGraphToCanvas,
  transformCanvasToBackendGraph,
} from '@/utils/workflowGraphTransformer';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  GitCommit,
  GripVertical,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function WorkflowEditorCanvas({
  definitionId,
  onBack,
  onSaveDraft,
  onValidateDraft,
  onPublishDraft,
  isSaving,
  isValidating,
  isPublishing,
}) {
  const { data: detailData, isLoading: isDetailLoading } =
    useWorkflowDefinitionDetail(definitionId);

  const definition = detailData?.definition;
  const draftData = detailData?.draft;
  const moduleName = definition?.module || 'ORDER';

  // Fetch Roles for Approval Step Assignee
  const { data: rolesResponse } = useQuery({
    queryKey: ['get_all_roles_workflow'],
    queryFn: getRoles,
    select: (res) => res.data?.data || [],
  });

  // Fetch Custom Forms for FORM step selection
  const { data: customFormsData = [] } = useQuery({
    queryKey: ['get_all_custom_forms_workflow'],
    queryFn: getAllCustomForms,
    select: (res) => (Array.isArray(res) ? res : res?.data || []),
  });

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Initialize canvas state from draft graph & enforce System Start node presence
  useEffect(() => {
    if (draftData?.graph) {
      const parsed = transformBackendGraphToCanvas(draftData.graph);
      let initialNodes = parsed.nodes || [];
      const hasStartNode = initialNodes.some(
        (n) => n.type === 'SYSTEM' || n.content?.start,
      );

      if (!hasStartNode) {
        const defaultStartKey = `SYSTEM_${moduleName}_START`;
        const startNode = {
          id: defaultStartKey,
          name: `System Start (${moduleName})`,
          type: 'SYSTEM',
          position: { x: 100, y: 100 },
          content: {
            key: defaultStartKey,
            label: `System Start (${moduleName})`,
            type: 'SYSTEM',
            start: true,
          },
        };
        initialNodes = [startNode, ...initialNodes];
      }

      setNodes(initialNodes);
      setEdges(parsed.edges || []);
    } else if (!isDetailLoading && nodes.length === 0) {
      const defaultStartKey = `SYSTEM_${moduleName}_START`;
      setNodes([
        {
          id: defaultStartKey,
          name: `System Start (${moduleName})`,
          type: 'SYSTEM',
          position: { x: 100, y: 100 },
          content: {
            key: defaultStartKey,
            label: `System Start (${moduleName})`,
            type: 'SYSTEM',
            start: true,
          },
        },
      ]);
    }

    if (draftData?.validationErrors) {
      setValidationErrors(draftData.validationErrors);
    }
    if (draftData?.valid !== undefined) {
      setIsValid(draftData.valid !== false);
    }
  }, [draftData, isDetailLoading, moduleName]);

  // Selected Node reference
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleAddStep = (stepTypeObj, insertIndex = null) => {
    const newStepKey = `${stepTypeObj.type}_${nodes.length + 1}`;

    const newNode = {
      id: newStepKey,
      name: `${stepTypeObj.label} ${nodes.length + 1}`,
      type: stepTypeObj.type,
      position: {
        x: 100 + (nodes.length % 3) * 240,
        y: 100 + Math.floor(nodes.length / 3) * 180,
      },
      content: {
        key: newStepKey,
        label: `${stepTypeObj.label} ${nodes.length + 1}`,
        type: stepTypeObj.type,
        start: stepTypeObj.isStart || false,
        assignee:
          stepTypeObj.type === 'APPROVAL'
            ? { type: 'ROLE', roleCode: 'MANAGER' }
            : null,
        formConfigurationId: stepTypeObj.type === 'FORM' ? 1 : null,
      },
    };

    setNodes((prev) => {
      const updated = [...prev];
      if (
        insertIndex !== null &&
        insertIndex >= 0 &&
        insertIndex <= updated.length
      ) {
        updated.splice(insertIndex, 0, newNode);
      } else {
        updated.push(newNode);
      }
      return updated;
    });

    // Automatically link previous node if present
    if (nodes.length > 0) {
      const prevIndex =
        insertIndex !== null && insertIndex > 0
          ? insertIndex - 1
          : nodes.length - 1;
      const lastNode = nodes[prevIndex];
      if (lastNode) {
        const availableEvents = ACTION_EVENTS[lastNode.type] || [];
        const eventOn =
          availableEvents.length > 0 ? availableEvents[0] : 'DEFAULT';

        setEdges((prev) => [
          ...prev,
          {
            id: `edge_${lastNode.id}_${newStepKey}`,
            sourceId: lastNode.id,
            targetId: newStepKey,
            type: eventOn,
            label: eventOn,
          },
        ]);
      }
    }

    setSelectedNodeId(newStepKey);
    toast.info(`Added ${stepTypeObj.label} step`);
  };

  const handleDragEnter = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === undefined) return;
    if (draggedIndex === targetIndex) return;

    setNodes((prevNodes) => {
      const updated = [...prevNodes];
      const [movedNode] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, movedNode);
      return updated;
    });
    setDraggedIndex(targetIndex);
  };

  const handleMoveNodeUp = (index) => {
    if (index <= 0) return;
    setNodes((prevNodes) => {
      const updated = [...prevNodes];
      const [movedNode] = updated.splice(index, 1);
      updated.splice(index - 1, 0, movedNode);
      return updated;
    });
  };

  const handleMoveNodeDown = (index) => {
    if (index >= nodes.length - 1) return;
    setNodes((prevNodes) => {
      const updated = [...prevNodes];
      const [movedNode] = updated.splice(index, 1);
      updated.splice(index + 1, 0, movedNode);
      return updated;
    });
  };

  const handleDropOnCanvas = (e, targetIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedIndex(null);

    let rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) {
      rawData = e.dataTransfer.getData('application/json');
    }
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);

      if (data.source === 'PALETTE' && data.stepType) {
        handleAddStep(data.stepType, targetIndex);
      } else if (data.type && data.label) {
        handleAddStep(data, targetIndex);
      } else if (data.source === 'CANVAS' && typeof data.index === 'number') {
        const fromIdx = data.index;
        if (targetIndex === null || targetIndex === undefined) return;
        if (fromIdx === targetIndex) return;

        setNodes((prevNodes) => {
          const updated = [...prevNodes];
          const [movedNode] = updated.splice(fromIdx, 1);
          updated.splice(targetIndex, 0, movedNode);
          return updated;
        });
      }
    } catch (err) {
      toast.error('Drop error:', err);
    }
  };

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
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleUpdateNodeContent = (nodeId, updatedContent) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (
      targetNode &&
      (targetNode.type === 'SYSTEM' || targetNode.content?.start) &&
      (updatedContent.key || updatedContent.label)
    ) {
      toast.warning(
        'System Start renaming is not allowed as it is directly co-related to the module.',
      );
      return;
    }

    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const newId = updatedContent.key || node.id;
          return {
            ...node,
            id: newId,
            name: updatedContent.label || node.name,
            content: { ...node.content, ...updatedContent },
          };
        }
        return node;
      }),
    );

    if (updatedContent.key && updatedContent.key !== nodeId) {
      setEdges((prev) =>
        prev.map((edge) => ({
          ...edge,
          sourceId:
            edge.sourceId === nodeId ? updatedContent.key : edge.sourceId,
          targetId:
            edge.targetId === nodeId ? updatedContent.key : edge.targetId,
        })),
      );
      setSelectedNodeId(updatedContent.key);
    }
  };

  const handleAddTransition = (sourceId, targetId, onEvent = 'DEFAULT') => {
    if (!targetId || sourceId === targetId) return;

    // Check if edge already exists
    const exists = edges.some(
      (e) =>
        e.sourceId === sourceId &&
        e.targetId === targetId &&
        e.type === onEvent,
    );
    if (exists) {
      toast.warning('Transition already exists');
      return;
    }

    setEdges((prev) => [
      ...prev,
      {
        id: `edge_${sourceId}_${targetId}_${Date.now()}`,
        sourceId,
        targetId,
        type: onEvent,
        label: onEvent,
      },
    ]);
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const buildBackendPayload = () => {
    return transformCanvasToBackendGraph({
      nodes,
      edges,
      moduleName,
      triggerType:
        moduleName === 'CUSTOM_WORKFLOW' || moduleName === 'CUSTOM'
          ? 'MANUAL_START'
          : 'RECORD_CREATED',
    });
  };

  const handleSaveDraftClick = async () => {
    const graphPayload = buildBackendPayload();
    const res = await onSaveDraft({ id: definitionId, graph: graphPayload });
    const data = res?.data?.data || res?.data || res;
    if (data) {
      setValidationErrors(data.validationErrors || []);
      setIsValid(data.valid !== false);
    }
  };

  const handleValidateClick = async () => {
    const res = await onValidateDraft({ id: definitionId });
    const data = res?.data?.data || res?.data || res;
    if (data) {
      setValidationErrors(data.validationErrors || []);
      setIsValid(data.valid !== false);
    }
  };

  const handlePublishClick = async () => {
    await onPublishDraft({ id: definitionId, activate: true });
  };

  if (isDetailLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="animate-pulse text-sm text-muted-foreground">
          Loading Workflow Canvas...
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-lg border bg-gray-50/50"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      {/* Canvas Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                {definition?.name || 'Workflow Editor'}
              </h2>
              <Badge variant="outline" className="font-mono text-xs uppercase">
                {moduleName}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Draft (v0)
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {nodes.length} Steps | {edges.length} Transitions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDraftClick}
            disabled={isSaving}
          >
            <Save className="mr-1 h-3.5 w-3.5" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleValidateClick}
            disabled={isValidating}
          >
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
          <Button
            size="sm"
            onClick={handlePublishClick}
            disabled={isPublishing || !isValid}
          >
            <Send className="mr-1 h-3.5 w-3.5" />
            {isPublishing ? 'Publishing...' : 'Publish & Activate'}
          </Button>
        </div>
      </div>

      {/* Main Studio Editor Workspace */}
      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* Left Palette: Step Types */}
        <div className="col-span-3 space-y-4 overflow-y-auto border-r bg-white p-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Step Palette
          </h3>

          <div className="space-y-2">
            {STEP_TYPES.filter((st) =>
              ['FORM', 'DATA_UPDATE', 'DOCUMENT_UPLOAD', 'END'].includes(
                st.type,
              ),
            ).map((st) => {
              const getIcon = () => {
                switch (st.type) {
                  case 'SYSTEM':
                    return <Zap className="h-4 w-4 text-amber-500" />;
                  case 'APPROVAL':
                    return <CheckSquare className="h-4 w-4 text-blue-500" />;
                  case 'FORM':
                    return <FileText className="h-4 w-4 text-emerald-500" />;
                  case 'DOCUMENT_UPLOAD':
                    return <UploadCloud className="h-4 w-4 text-purple-500" />;
                  case 'STATUS_UPDATE':
                    return <GitCommit className="h-4 w-4 text-indigo-500" />;
                  case 'END':
                    return <CheckCircle className="h-4 w-4 text-red-500" />;
                  default:
                    return <Plus className="h-4 w-4 text-gray-500" />;
                }
              };

              return (
                <button
                  key={st.type}
                  type="button"
                  draggable={true}
                  onDragStart={(e) => {
                    const payload = JSON.stringify({
                      source: 'PALETTE',
                      stepType: st,
                    });
                    e.dataTransfer.setData('text/plain', payload);
                    e.dataTransfer.setData('application/json', payload);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => handleAddStep(st)}
                  className="flex w-full cursor-grab items-center justify-between rounded-lg border p-2.5 text-left text-xs font-medium transition-all hover:border-primary hover:bg-primary/5 active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-gray-400" />
                    {getIcon()}
                    <span>{st.label}</span>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Canvas: Graph View */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => handleDropOnCanvas(e)}
          className="bg-dots col-span-6 space-y-4 overflow-auto bg-gray-50 p-4"
        >
          {nodes.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <div>
                <Zap className="mx-auto h-8 w-8 text-gray-400" />
                <h4 className="mt-2 text-sm font-semibold text-gray-900">
                  Canvas is empty
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Drag & drop steps from the left Step Palette onto the canvas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map((node, index) => {
                const isSelected = node.id === selectedNodeId;
                const isSystemStart =
                  node.type === 'SYSTEM' || node.content?.start;
                const nodeEdgesOut = edges.filter(
                  (e) => e.sourceId === node.id,
                );
                const isBeingDragged = draggedIndex === index;

                return (
                  <Card
                    key={node.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      const payload = JSON.stringify({
                        source: 'CANVAS',
                        index,
                      });
                      e.dataTransfer.setData('text/plain', payload);
                      e.dataTransfer.setData('application/json', payload);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedIndex(index);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== index) {
                        handleDragEnter(index);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleDropOnCanvas(e, index);
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`cursor-grab select-none border p-3 transition-all active:cursor-grabbing ${
                      isBeingDragged
                        ? 'border-dashed border-primary bg-primary/10 opacity-30'
                        : isSelected
                          ? 'border-primary bg-white shadow-md ring-2 ring-primary/20'
                          : 'bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline" className="font-mono text-xs">
                          {node.type}
                        </Badge>
                        <h4 className="text-sm font-bold text-gray-900">
                          {node.name}
                        </h4>
                        {isSystemStart && (
                          <Badge className="bg-amber-500 text-[10px] text-white">
                            System Start
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-gray-500 hover:bg-gray-100"
                            title="Move Step Up"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveNodeUp(index);
                            }}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {index < nodes.length - 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-gray-500 hover:bg-gray-100"
                            title="Move Step Down"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveNodeDown(index);
                            }}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!isSystemStart && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-500 hover:bg-red-50"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(node.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Step details summary */}
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p className="font-mono">
                        Key: {node.content?.key || node.id}
                      </p>
                      {node.type === 'APPROVAL' && (
                        <p>
                          Assignee: Role (
                          {node.content?.assignee?.roleCode || 'MANAGER'})
                        </p>
                      )}
                      {node.type === 'FORM' && (
                        <p>
                          Form Config ID:{' '}
                          {node.content?.formConfigurationId || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Transitions list out */}
                    {nodeEdgesOut.length > 0 && (
                      <div className="mt-3 space-y-1 border-t pt-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          Transitions Out:
                        </span>
                        {nodeEdgesOut.map((edge) => (
                          <div
                            key={edge.id}
                            className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs"
                          >
                            <span className="flex items-center gap-1 font-mono text-gray-700">
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                              To{' '}
                              <strong className="text-gray-900">
                                {edge.targetId}
                              </strong>
                              {edge.type !== 'DEFAULT' && (
                                <Badge
                                  variant="secondary"
                                  className="ml-1 text-[10px]"
                                >
                                  on: {edge.type}
                                </Badge>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEdge(edge.id);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Inspector & Validation Panel */}
        <div className="col-span-3 space-y-4 overflow-y-auto border-l bg-white p-4">
          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-900 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>Validation Errors</span>
              </div>
              <div className="mt-1.5 space-y-1 text-xs text-red-800">
                {validationErrors.map((err) => (
                  <p key={err.code || err.path || err.message}>
                    • {err.message || err.code}
                  </p>
                ))}
              </div>
            </div>
          )}

          {selectedNode ? (
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Step Inspector: {selectedNode.name}
              </h3>

              <div>
                <Label className="text-xs">Step Key (Unique Slug)</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  value={selectedNode.content?.key || selectedNode.id}
                  disabled={
                    selectedNode.type === 'SYSTEM' ||
                    selectedNode.content?.start
                  }
                  onChange={(e) =>
                    handleUpdateNodeContent(selectedNode.id, {
                      key: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-xs">Display Label</Label>
                <Input
                  className="mt-1 text-xs"
                  value={selectedNode.content?.label || selectedNode.name}
                  disabled={
                    selectedNode.type === 'SYSTEM' ||
                    selectedNode.content?.start
                  }
                  onChange={(e) =>
                    handleUpdateNodeContent(selectedNode.id, {
                      label: e.target.value,
                    })
                  }
                />
                {(selectedNode.type === 'SYSTEM' ||
                  selectedNode.content?.start) && (
                  <p className="mt-1 text-[11px] font-medium text-amber-600">
                    System Start renaming is disabled as it is directly
                    co-related to the module.
                  </p>
                )}
              </div>

              {selectedNode.type === 'APPROVAL' && (
                <div>
                  <Label className="text-xs">Assignee Role</Label>
                  <Select
                    value={
                      selectedNode.content?.assignee?.roleCode || 'MANAGER'
                    }
                    onValueChange={(val) =>
                      handleUpdateNodeContent(selectedNode.id, {
                        assignee: { type: 'ROLE', roleCode: val },
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesResponse.length > 0 ? (
                        rolesResponse.map((r) => (
                          <SelectItem
                            key={r.id || r.roleCode}
                            value={r.roleCode || r.name}
                          >
                            {r.name || r.roleCode}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="FINANCE">Finance</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.type === 'FORM' && (
                <div>
                  <Label className="text-xs">Custom Form Configuration</Label>
                  <Select
                    value={
                      selectedNode.content?.formConfigurationId
                        ? String(selectedNode.content.formConfigurationId)
                        : ''
                    }
                    onValueChange={(val) =>
                      handleUpdateNodeContent(selectedNode.id, {
                        formConfigurationId: Number(val),
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue placeholder="Select Custom Form" />
                    </SelectTrigger>
                    <SelectContent>
                      {customFormsData.length > 0 ? (
                        customFormsData.map((form) => (
                          <SelectItem
                            key={form.id || form.formKey || form.name}
                            value={String(form.id)}
                          >
                            {form.name ||
                              form.title ||
                              form.formKey ||
                              `Custom Form #${form.id}`}{' '}
                            (ID: {form.id})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="1">Default Form (ID: 1)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Add New Transition Link */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-xs font-bold">
                  Add Transition Target
                </Label>
                <Select
                  onValueChange={(targetId) => {
                    const availableEvents = ACTION_EVENTS[
                      selectedNode.type
                    ] || ['DEFAULT'];
                    handleAddTransition(
                      selectedNode.id,
                      targetId,
                      availableEvents[0] || 'DEFAULT',
                    );
                  }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Connect to step..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes
                      .filter((n) => n.id !== selectedNode.id)
                      .map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.name} ({n.id})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Select a step node on the canvas to inspect & configure
              properties.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
