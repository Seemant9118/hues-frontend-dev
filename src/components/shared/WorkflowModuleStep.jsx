import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import WorkflowFormFieldsRenderer from '@/components/shared/components/WorkflowFormFieldsRenderer';
import { useActiveWorkflowRuntime } from '@/hooks/workflows/useWorkflowRuntime';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  FileText,
  GitCommit,
  Network,
  UploadCloud,
  Zap,
} from 'lucide-react';

export default function WorkflowModuleStep({
  formData,
  setFormData,
  module = 'ORDER',
  stepKey,
  stepData,
}) {
  const { data: runtimeData, isLoading } = useActiveWorkflowRuntime(module);

  const definition = runtimeData?.definition;
  const version = runtimeData?.version;
  const runtime = runtimeData?.runtime;
  const steps = runtime?.steps || [];

  // Find freshest step data from active runtime steps, fallback to prop stepData
  const activeStepFromRuntime = steps.find(
    (s) =>
      s.key === stepKey ||
      s.key === stepData?.key ||
      `workflow-${s.key}` === stepKey,
  );

  const targetStep = activeStepFromRuntime || stepData;

  const formFields =
    targetStep?.formConfiguration?.fields ||
    targetStep?.formConfig?.fields ||
    targetStep?.fields ||
    stepData?.formConfiguration?.fields ||
    [];

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

  const handleStepValueChange = (key, field, value) => {
    setFormData?.((prev) => ({
      ...prev,
      [field]: value,
      customFields: {
        ...(prev?.customFields || {}),
        [field]: value,
      },
      workflowStepValues: {
        ...(prev?.workflowStepValues || {}),
        [key]: {
          ...(prev?.workflowStepValues?.[key] || {}),
          [field]: value,
        },
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center p-6">
        <p className="animate-pulse text-sm text-muted-foreground">
          Loading Workflow Form Step...
        </p>
      </div>
    );
  }

  if (
    !runtimeData ||
    runtimeData.source === 'NO_ACTIVE_NO_CODE_WORKFLOW' ||
    !definition
  ) {
    return (
      <Card className="space-y-2 border-amber-200 bg-amber-50/50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
        <h4 className="text-sm font-bold text-amber-950">
          No Active Workflow Configured for {module}
        </h4>
        <p className="text-xs text-amber-800">
          Standard form fields will apply.
        </p>
      </Card>
    );
  }

  // If rendering a specific step
  if (targetStep) {
    const currentStepValues =
      formData?.workflowStepValues?.[targetStep.key] || {};

    return (
      <div className="space-y-6">
        {/* Step Form Renderers */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase text-primary">
            {targetStep.label || targetStep.key}
          </h4>

          {/* APPROVAL Step UI */}
          {targetStep.type === 'APPROVAL' && (
            <div className="space-y-4">
              <div className="rounded-md border bg-blue-50/50 p-3 text-xs text-blue-900">
                <p>
                  <strong>Approval Assigned To:</strong> Role (
                  {targetStep.assignee?.roleCode || 'MANAGER'})
                </p>
                <p className="mt-1 text-[11px] text-blue-700">
                  This step requires manager approval upon order submission.
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold">
                  Approval Remarks / Pre-Approval Note
                </Label>
                <Textarea
                  rows={3}
                  className="mt-1 text-xs"
                  placeholder="Enter remarks or approval instructions..."
                  value={currentStepValues.remarks || ''}
                  onChange={(e) =>
                    handleStepValueChange(
                      targetStep.key,
                      'remarks',
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* FORM Step UI - Dynamic Field Renderer */}
          {targetStep.type === 'FORM' && (
            <WorkflowFormFieldsRenderer
              formFields={formFields}
              currentStepValues={currentStepValues}
              formData={formData}
              targetStepKey={targetStep.key}
              onStepValueChange={handleStepValueChange}
            />
          )}

          {/* DOCUMENT_UPLOAD Step UI */}
          {/* {targetStep.type === 'DOCUMENT_UPLOAD' && (
            <DocumentUploadStep
              formData={formData}
              setFormData={setFormData}
              module={module}
              stepKey={targetStep.key}
              stepData={targetStep}
            />
          )} */}

          {/* Fallback for auto-processed steps */}
          {!['APPROVAL', 'FORM'].includes(targetStep.type) && (
            <div className="rounded-md border bg-gray-50 p-3 text-xs text-gray-700">
              <p>
                Step <strong className="font-mono">{targetStep.key}</strong> is
                auto-processed by the backend workflow engine.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback: Overview of pipeline
  return (
    <div className="space-y-6">
      {/* Workflow Banner & Definition Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-gradient-to-r from-primary/5 via-white to-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                {definition.name}
              </h3>
              <Badge className="bg-primary text-xs text-white">
                v{version?.version || 1} Active
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Module:{' '}
              <strong className="font-mono text-gray-800">{module}</strong> |
              Trigger:{' '}
              <strong className="font-mono text-gray-800">
                {runtime?.trigger?.type || 'RECORD_CREATED'}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Active Pipeline Flowchart Visualization */}
      <Card className="space-y-3 border bg-white p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Active Workflow Pipeline Sequence ({steps.length} Steps)
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((st, idx) => (
            <div key={st.key} className="flex items-center gap-1.5">
              <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800">
                {getStepIcon(st.type)}
                <span>{st.label || st.key}</span>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase"
                >
                  {st.type}
                </Badge>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
