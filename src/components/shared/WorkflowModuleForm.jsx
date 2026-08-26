'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  useActiveWorkflowRuntime,
  useWorkflowRuntimeMutations,
} from '@/hooks/workflows/useWorkflowRuntime';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  FileText,
  GitCommit,
  History,
  Network,
  Send,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function WorkflowModuleForm({
  module = 'ORDER',
  title = 'Workflow-Driven Form',
  onCancel,
  onSuccess,
}) {
  const { data: runtimeData, isLoading } = useActiveWorkflowRuntime(module);

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
        if (onSuccess) onSuccess(data);
      },
      onActionSuccess: (data) => {
        setActiveInstance(data);
        if (onSuccess) onSuccess(data);
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
      toast.error('Please enter an amount');
      return;
    }

    await startInstance({
      module,
      recordId: `${module}-${Date.now().toString().slice(-6)}`,
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
    <Wrapper className="min-h-screen space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-white pb-3 pt-4">
        <div className="flex items-center gap-3">
          {onCancel && (
            <Button size="icon" variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="mt-1 flex items-center gap-2 text-xl font-bold text-gray-900">
              <Network className="h-5 w-5 text-primary" />
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Module: {module}
          </Badge>
          {definition && (
            <>
              <Badge variant="secondary" className="font-mono text-xs">
                {definition.name}
              </Badge>
              <Badge className="bg-primary text-xs text-white">
                v{version?.version || 1} Active
              </Badge>
            </>
          )}
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel / Back
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-white p-8">
          <p className="animate-pulse text-sm text-muted-foreground">
            Fetching active workflow runtime for module {module}...
          </p>
        </div>
      )}

      {isNoActiveWorkflow && (
        <Card className="space-y-4 border-amber-200 bg-amber-50/50 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <div>
            <h3 className="text-base font-bold text-amber-950">
              No Active Workflow Definition for {module}
            </h3>
            <p className="mt-1 text-xs text-amber-800">
              There is currently no active published workflow definition for
              module{' '}
              <strong className="font-mono text-amber-950">{module}</strong>.
            </p>
          </div>
          <div className="pt-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Go Back to Listing
              </Button>
            )}
          </div>
        </Card>
      )}

      {!isLoading && !isNoActiveWorkflow && (
        <div className="grid grid-cols-12 gap-6">
          {/* Main Form Column */}
          <div className="col-span-12 space-y-6 lg:col-span-8">
            {/* Step Pipeline Progress Visualizer */}
            <Card className="border bg-white p-4">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Active Step Pipeline ({steps.length} Steps)
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {steps.map((st, idx) => {
                  const isCurrent = activeInstance?.currentStep?.key === st.key;
                  const isCompleted =
                    activeInstance?.instance?.status === 'COMPLETED';

                  return (
                    <div key={st.key} className="flex items-center gap-1.5">
                      <div
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          isCurrent
                            ? 'border-primary bg-primary/10 font-bold text-primary ring-2 ring-primary/20'
                            : isCompleted
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {getStepIcon(st.type)}
                        <span>{st.label || st.key}</span>
                      </div>
                      {idx < steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Step 1: Initial Record Creation Form */}
            {!activeInstance && (
              <Card className="space-y-5 border bg-white p-6">
                <div className="border-b pb-3">
                  <h3 className="text-base font-bold text-gray-900">
                    Step 1: Initial {module} Details
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Enter the primary record details to trigger the workflow
                    pipeline.
                  </p>
                </div>

                <form onSubmit={handleStartInstance} className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold">
                      Amount ($) *
                    </Label>
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
                    <Label className="text-xs font-semibold">Client Type</Label>
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
                    <Label className="text-xs font-semibold">
                      Notes / Context
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder="Additional notes for this workflow execution..."
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

                  <Button
                    type="submit"
                    className="mt-2 w-full"
                    disabled={isStarting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isStarting
                      ? 'Initiating Workflow...'
                      : `Start ${module} Workflow`}
                  </Button>
                </form>
              </Card>
            )}

            {/* Active Step Executor Panel */}
            {activeInstance && (
              <div className="space-y-6">
                <Card className="flex items-center justify-between border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
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
                </Card>

                {activeInstance.instance?.status !== 'COMPLETED' && (
                  <Card className="space-y-4 border bg-white p-6">
                    <div className="border-b pb-3">
                      <h3 className="text-base font-bold text-gray-900">
                        Execute Active Step:{' '}
                        {activeInstance.currentStep?.label ||
                          activeInstance.currentStep?.key}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Step Type:{' '}
                        <strong className="font-mono">
                          {activeInstance.currentStep?.type}
                        </strong>
                      </p>
                    </div>

                    {/* APPROVAL Step Actions */}
                    {activeInstance.currentStep?.type === 'APPROVAL' && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs">Approval Comment</Label>
                          <Input
                            className="mt-1"
                            placeholder="e.g. Details verified and approved"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={isSubmittingAction}
                            onClick={() => handleSubmitAction('APPROVE')}
                          >
                            Approve Step
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={isSubmittingAction}
                            onClick={() => handleSubmitAction('REJECT')}
                          >
                            Reject Step
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* FORM Step Actions */}
                    {activeInstance.currentStep?.type === 'FORM' && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs">
                            Form Data / Submission Notes
                          </Label>
                          <Textarea
                            className="mt-1"
                            rows={3}
                            placeholder="Enter form values or notes..."
                            value={customFormValues}
                            onChange={(e) =>
                              setCustomFormValues(e.target.value)
                            }
                          />
                        </div>
                        <Button
                          disabled={isSubmittingAction}
                          onClick={() => handleSubmitAction('SUBMIT_FORM')}
                        >
                          Submit Form Step
                        </Button>
                      </div>
                    )}

                    {/* DOCUMENT_UPLOAD Step Actions */}
                    {activeInstance.currentStep?.type === 'DOCUMENT_UPLOAD' && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-xs">
                            Document IDs (Comma-separated)
                          </Label>
                          <Input
                            className="mt-1"
                            placeholder="e.g. 101, 102"
                            value={docIds}
                            onChange={(e) => setDocIds(e.target.value)}
                          />
                        </div>
                        <Button
                          disabled={isSubmittingAction}
                          onClick={() => handleSubmitAction('UPLOAD_DOCUMENT')}
                        >
                          Submit Documents
                        </Button>
                      </div>
                    )}

                    {/* Auto-processed steps fallback */}
                    {[
                      'SYSTEM',
                      'STATUS_UPDATE',
                      'NOTIFICATION',
                      'END',
                    ].includes(activeInstance.currentStep?.type) && (
                      <p className="py-2 text-xs text-muted-foreground">
                        Step type{' '}
                        <strong className="font-mono">
                          {activeInstance.currentStep?.type}
                        </strong>{' '}
                        is auto-processed by the backend workflow runtime
                        engine.
                      </p>
                    )}
                  </Card>
                )}

                {activeInstance.instance?.status === 'COMPLETED' && (
                  <Card className="space-y-3 border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-950">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                    <h3 className="text-lg font-bold">Workflow Completed!</h3>
                    <p className="text-xs text-emerald-800">
                      The workflow instance has finished all pipeline steps
                      successfully.
                    </p>
                    {onCancel && (
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={onCancel}
                      >
                        Back to Listing
                      </Button>
                    )}
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="col-span-12 space-y-6 lg:col-span-4">
            <Card className="space-y-4 border bg-white p-4">
              <h3 className="border-b pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Workflow Metadata
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Module:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {module}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Definition:</span>
                  <span className="font-medium text-gray-900">
                    {definition?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Version:</span>
                  <span className="font-mono text-gray-900">
                    v{version?.version || 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Steps:</span>
                  <span className="font-mono text-gray-900">
                    {steps.length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Audit Log / History Preview */}
            {activeInstance?.logs && activeInstance.logs.length > 0 && (
              <Card className="space-y-3 border bg-white p-4">
                <h3 className="flex items-center gap-1.5 border-b pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  Workflow Execution Audit Log
                </h3>
                <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                  {activeInstance.logs.map((log) => (
                    <div
                      key={log}
                      className="space-y-1 rounded border bg-gray-50 p-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-gray-800">
                        <span>{log.actionType}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {log.result?.status || 'DONE'}
                        </Badge>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        Event: {log.result?.event || log.actionKey || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </Wrapper>
  );
}
