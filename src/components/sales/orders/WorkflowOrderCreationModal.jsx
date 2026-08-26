'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useActiveWorkflowRuntime,
  useWorkflowRuntimeMutations,
} from '@/hooks/workflows/useWorkflowRuntime';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  FileText,
  GitCommit,
  Network,
  Send,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function WorkflowOrderCreationModal({ isOpen, onClose }) {
  const moduleName = 'ORDER';
  const { data: runtimeData, isLoading } = useActiveWorkflowRuntime(
    moduleName,
    {
      enabled: isOpen,
    },
  );

  const [activeInstance, setActiveInstance] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    clientType: 'B2B',
    notes: '',
  });

  // Action states
  const [approvalComment, setApprovalComment] = useState('');
  const [customFormValues, setCustomFormValues] = useState('');
  const [docIds, setDocIds] = useState('');

  const { startInstance, isStarting, submitAction, isSubmittingAction } =
    useWorkflowRuntimeMutations({
      onStarted: (data) => {
        setActiveInstance(data);
      },
      onActionSuccess: (data) => {
        setActiveInstance(data);
      },
    });

  const isNoActiveWorkflow =
    !isLoading &&
    (!runtimeData ||
      runtimeData.source === 'NO_ACTIVE_NO_CODE_WORKFLOW' ||
      !runtimeData.definition);

  const definition = runtimeData?.definition;
  const version = runtimeData?.version;
  const runtime = runtimeData?.runtime;
  const steps = runtime?.steps || [];

  const handleStartInstance = async (e) => {
    e.preventDefault();
    if (!formData.amount) {
      toast.error('Please enter an amount for the order');
      return;
    }

    await startInstance({
      module: moduleName,
      recordId: `ORD-${Date.now().toString().slice(-6)}`,
      context: {
        amount: Number(formData.amount),
        clientType: formData.clientType,
        notes: formData.notes,
      },
    });
  };

  const handleSubmitAction = async (actionType) => {
    if (
      !activeInstance?.instance?.id ||
      !activeInstance?.currentStepInstance?.id
    ) {
      toast.error('No active step instance found');
      return;
    }

    const instanceId = activeInstance.instance.id;
    const stepInstanceId = activeInstance.currentStepInstance.id;

    const payload = { action: actionType };

    if (actionType === 'APPROVE' || actionType === 'REJECT') {
      payload.comment = approvalComment || actionType;
    } else if (actionType === 'SUBMIT_FORM') {
      payload.formConfigurationId =
        activeInstance.currentStep?.formConfigurationId || 1;
      try {
        payload.values = customFormValues ? JSON.parse(customFormValues) : {};
      } catch {
        payload.values = { notes: customFormValues };
      }
    } else if (actionType === 'UPLOAD_DOCUMENT') {
      payload.documentIds = docIds
        .split(',')
        .map((id) => Number(id.trim()))
        .filter(Boolean);
    }

    await submitAction({
      instanceId,
      stepInstanceId,
      payload,
    });
  };

  const handleReset = () => {
    setActiveInstance(null);
    setFormData({ amount: '', clientType: 'B2B', notes: '' });
    setApprovalComment('');
    setCustomFormValues('');
    setDocIds('');
    onClose();
  };

  const getStepIcon = (type) => {
    switch (type) {
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
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      default:
        return <Network className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Network className="h-5 w-5 text-primary" />
                Workflow-Driven Sales Order
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Module:{' '}
                <span className="font-semibold text-gray-800">ORDER</span>
              </p>
            </div>
            {definition && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {definition.name}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  v{version?.version || 1} Active
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex h-48 items-center justify-center py-8">
            <p className="animate-pulse text-sm text-muted-foreground">
              Fetching active runtime workflow for Sales Order...
            </p>
          </div>
        )}

        {isNoActiveWorkflow && (
          <div className="my-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>No Active Workflow Found</span>
            </div>
            <p className="mt-1.5 text-xs text-amber-800">
              There is currently no active no-code workflow definition published
              for module{' '}
              <strong className="font-mono text-amber-950">ORDER</strong>.
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Please go to <strong>Workflow Engine</strong> to activate a
              published workflow definition.
            </p>
          </div>
        )}

        {!isLoading && !isNoActiveWorkflow && (
          <div className="space-y-6 py-2">
            {/* Active Workflow Step Pipeline */}
            <div className="rounded-lg border bg-gray-50/50 p-3">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workflow Step Pipeline ({steps.length} Steps)
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {steps.map((st, idx) => {
                  const isCurrent = activeInstance?.currentStep?.key === st.key;
                  const isCompleted =
                    activeInstance?.instance?.status === 'COMPLETED';

                  return (
                    <div key={st.key} className="flex items-center gap-1.5">
                      <div
                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                          isCurrent
                            ? 'border-primary bg-primary/10 font-bold text-primary ring-2 ring-primary/20'
                            : isCompleted
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'bg-white text-gray-700'
                        }`}
                      >
                        {getStepIcon(st.type)}
                        <span>{st.label || st.key}</span>
                      </div>
                      {idx < steps.length - 1 && (
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* If no instance created yet: Start Order Form */}
            {!activeInstance && (
              <form onSubmit={handleStartInstance} className="space-y-4">
                <Card className="space-y-3 border bg-white p-4">
                  <h4 className="text-sm font-bold text-gray-900">
                    Step 1: Order Creation Details
                  </h4>
                  <div>
                    <Label className="text-xs">Order Amount ($) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      className="mt-1"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Client Type</Label>
                    <Input
                      placeholder="e.g. B2B"
                      className="mt-1"
                      value={formData.clientType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clientType: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Order Notes</Label>
                    <Textarea
                      rows={2}
                      placeholder="Additional order context..."
                      className="mt-1"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </Card>

                <Button type="submit" className="w-full" disabled={isStarting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isStarting
                    ? 'Starting Workflow...'
                    : 'Initiate Workflow Sales Order'}
                </Button>
              </form>
            )}

            {/* Active Instance Execution Panel */}
            {activeInstance && (
              <div className="space-y-4">
                <Card className="space-y-3 border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">
                          Workflow Instance In Progress
                        </h4>
                        <p className="font-mono text-xs text-emerald-800">
                          Instance ID: {activeInstance.instance?.id} | Status:{' '}
                          {activeInstance.instance?.status}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-xs text-white">
                      Active Step:{' '}
                      {activeInstance.currentStep?.label ||
                        activeInstance.currentStep?.key ||
                        'Processing'}
                    </Badge>
                  </div>
                </Card>

                {/* Available Actions Execution */}
                {activeInstance.instance?.status !== 'COMPLETED' && (
                  <Card className="space-y-4 border bg-white p-4">
                    <h4 className="border-b pb-2 text-sm font-bold text-gray-900">
                      Execute Active Step Actions:{' '}
                      {activeInstance.currentStep?.type}
                    </h4>

                    {/* APPROVAL Actions */}
                    {activeInstance.currentStep?.type === 'APPROVAL' && (
                      <div className="space-y-3">
                        <Label className="text-xs">Approval Comment</Label>
                        <Input
                          placeholder="e.g. Order details verified and approved"
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={isSubmittingAction}
                            onClick={() => handleSubmitAction('APPROVE')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isSubmittingAction}
                            onClick={() => handleSubmitAction('REJECT')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* FORM Actions */}
                    {activeInstance.currentStep?.type === 'FORM' && (
                      <div className="space-y-3">
                        <Label className="text-xs">Form Input / Notes</Label>
                        <Textarea
                          placeholder="Enter form submission data or JSON..."
                          value={customFormValues}
                          onChange={(e) => setCustomFormValues(e.target.value)}
                        />
                        <Button
                          size="sm"
                          disabled={isSubmittingAction}
                          onClick={() => handleSubmitAction('SUBMIT_FORM')}
                        >
                          Submit Form
                        </Button>
                      </div>
                    )}

                    {/* DOCUMENT_UPLOAD Actions */}
                    {activeInstance.currentStep?.type === 'DOCUMENT_UPLOAD' && (
                      <div className="space-y-3">
                        <Label className="text-xs">
                          Document IDs (Comma separated)
                        </Label>
                        <Input
                          placeholder="e.g. 101, 102"
                          value={docIds}
                          onChange={(e) => setDocIds(e.target.value)}
                        />
                        <Button
                          size="sm"
                          disabled={isSubmittingAction}
                          onClick={() => handleSubmitAction('UPLOAD_DOCUMENT')}
                        >
                          Submit Document IDs
                        </Button>
                      </div>
                    )}

                    {/* Fallback for other actions */}
                    {[
                      'SYSTEM',
                      'STATUS_UPDATE',
                      'NOTIFICATION',
                      'END',
                    ].includes(activeInstance.currentStep?.type) && (
                      <p className="text-xs text-muted-foreground">
                        Step type{' '}
                        <strong className="font-mono">
                          {activeInstance.currentStep?.type}
                        </strong>{' '}
                        is auto-processed by the backend workflow engine.
                      </p>
                    )}
                  </Card>
                )}

                {activeInstance.instance?.status === 'COMPLETED' && (
                  <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-900">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                    <h4 className="text-sm font-bold">Workflow Completed!</h4>
                    <p className="text-xs text-emerald-800">
                      The workflow instance has finished all steps successfully.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={handleReset}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
