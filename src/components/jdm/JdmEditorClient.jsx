'use client';

import { ruleEngineAPI } from '@/api/rule-engine-apis/ruleEngineAPI';
import { PlayCircle } from 'lucide-react';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createRulesEngine,
  getRulesEngineContexts,
  updateRulesEngine,
} from '@/services/Rule_Engine_Services/RuleEngineServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

// Shadcn Skeleton Loader
const EditorSkeleton = () => {
  return (
    <div className="h-full w-full space-y-4 p-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-[70%] w-full" />
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
};

function JdmEditorClient({ queryClient, onCancel, existingRuleData }) {
  const [Editor, setEditor] = useState(null);
  const [value, setValue] = useState({ nodes: [], edges: [] });
  const [simulation, setSimulation] = useState();
  const [formData, setFormData] = useState({
    contextId: '',
    ruleName: '',
  });
  const [errors, setErrors] = useState({});

  const { data: contexts = [], isLoading: isContextsLoading } = useQuery({
    queryKey: [ruleEngineAPI.getRulesEngineContexts.endpointKey],
    queryFn: getRulesEngineContexts,
    select: (response) => response.data.data,
  });

  // React Query Mutation
  const simulateMutation = useMutation({
    mutationFn: async ({ graph, context }) => {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, content: graph }),
      });

      if (!response.ok) throw new Error('API Error');

      return response.json();
    },
    onSuccess: (data, variables) => {
      setSimulation({
        result: { ...data, snapshot: variables.graph },
      });
    },
    onError: (err) => {
      toast.error(err.message || 'Simulation failed');
    },
  });

  const createRulesEngineMutation = useMutation({
    mutationFn: createRulesEngine,
    onSuccess: () => {
      toast.success('Rule engine created successfully');
      onCancel?.();
      queryClient.invalidateQueries([ruleEngineAPI.getRulesEngine.endpointKey]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create rule');
    },
  });

  const updateRulesEngineMutation = useMutation({
    mutationFn: updateRulesEngine,
    onSuccess: () => {
      toast.success('Rule engine updated successfully');
      onCancel?.();
      queryClient.invalidateQueries([ruleEngineAPI.getRulesEngine.endpointKey]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update rule');
    },
  });

  useEffect(() => {
    Promise.all([
      import('@gorules/jdm-editor'),
      import('@gorules/jdm-editor/dist/style.css'),
    ]).then(([mod]) => {
      setEditor({
        DecisionGraph: mod.DecisionGraph,
        JdmConfigProvider: mod.JdmConfigProvider,
        GraphSimulator: mod.GraphSimulator,
      });
    });
  }, []);

  useEffect(() => {
    if (!existingRuleData) {
      setValue({ nodes: [], edges: [] });
      setFormData({ contextId: '', ruleName: '' });
      setErrors({});
      setSimulation(undefined);
      return;
    }

    const rawRuleJson = existingRuleData?.ruleJson;
    let parsedRuleJson = rawRuleJson;

    if (typeof rawRuleJson === 'string') {
      try {
        parsedRuleJson = JSON.parse(rawRuleJson);
      } catch (error) {
        parsedRuleJson = rawRuleJson;
      }
    }

    if (parsedRuleJson && typeof parsedRuleJson === 'object') {
      setValue(parsedRuleJson);
    }

    setFormData({
      contextId: String(existingRuleData?.contextId ?? ''),
      ruleName: existingRuleData?.ruleName ?? '',
    });
    setErrors({});
    setSimulation(undefined);
  }, [existingRuleData]);

  // Show Skeleton while loading
  if (!Editor) {
    return (
      <div
        className="border"
        style={{ height: 'calc(100vh - 100px)', width: '100%' }}
      >
        <EditorSkeleton />
      </div>
    );
  }

  const { DecisionGraph, JdmConfigProvider, GraphSimulator } = Editor;

  const handleFieldChange = (field, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: fieldValue,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = () => {
    const trimmedRuleName = formData.ruleName.trim();
    const newErrors = {};

    if (!formData.contextId) {
      newErrors.contextId = 'Context is required';
    }

    if (!trimmedRuleName) {
      newErrors.ruleName = 'Rule name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const numericContextId = Number(formData.contextId);
    const payload = {
      ruleName: trimmedRuleName,
      contextId: Number.isNaN(numericContextId)
        ? formData.contextId
        : numericContextId,
      ruleJson: value,
    };

    if (existingRuleData) {
      updateRulesEngineMutation.mutate({
        data: {
          ...payload,
          ruleId: existingRuleData?.id,
        },
      });
      return;
    }

    createRulesEngineMutation.mutate({ data: payload });
  };

  return (
    <div
      className="border"
      style={{ height: 'calc(100vh - 250px)', width: '100%' }}
    >
      <div className="grid grid-cols-1 gap-4 border-b bg-white p-4 md:grid-cols-2">
        <div>
          <Label>
            Context <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.contextId}
            onValueChange={(selectedValue) =>
              handleFieldChange('contextId', selectedValue)
            }
            disabled={isContextsLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isContextsLoading ? 'Loading contexts...' : 'Select context'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {contexts?.map((ctx) => (
                <SelectItem key={ctx.id} value={String(ctx.id)}>
                  {ctx.context}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contextId && <ErrorBox msg={errors.contextId} />}
        </div>

        <div>
          <Label>
            Rule Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.ruleName}
            onChange={(event) =>
              handleFieldChange('ruleName', event.target.value)
            }
            placeholder="Enter rule name"
          />
          {errors.ruleName && <ErrorBox msg={errors.ruleName} />}
        </div>
      </div>

      <JdmConfigProvider>
        <DecisionGraph
          value={value}
          onChange={setValue}
          simulate={simulation}
          panels={[
            {
              id: 'simulator',
              title: 'Simulator',
              icon: <PlayCircle size={16} />,
              renderPanel: () => (
                <GraphSimulator
                  onClear={() => setSimulation(undefined)}
                  onRun={({ graph, context }) => {
                    simulateMutation.mutate({ graph, context });
                  }}
                />
              ),
            },
          ]}
        />
      </JdmConfigProvider>

      <div className="flex items-center justify-end border border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            debounceTime={0}
            size="sm"
            onClick={handleSubmit}
            disabled={
              createRulesEngineMutation.isPending ||
              updateRulesEngineMutation.isPending
            }
          >
            {existingRuleData ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Memoized Export
export default memo(JdmEditorClient);
