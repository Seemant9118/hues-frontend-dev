'use client';

import { ruleEngineAPI } from '@/api/rule-engine-apis/ruleEngineAPI';
import RulesEngineHeader from '@/components/admin/rules-engine/RulesEngineHeader';
import { Card } from '@/components/ui/card';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Wrapper from '@/components/wrappers/Wrapper';
import { getRulesEngine } from '@/services/Rule_Engine_Services/RuleEngineServices';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, GitGraph } from 'lucide-react';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const JdmEditor = dynamic(() => import('@/components/jdm/JdmEditorClient'), {
  ssr: false,
});

export default function RulesEnginePage() {
  const queryClient = useQueryClient();

  // Mode & Navigation State
  const [isJDMEditorOpen, setIsJDMEditorOpen] = useState(false);
  const [existingRuleData, setExistingRuleData] = useState(null);

  // Queries & Side Effects
  const { data: rules = [], isLoading: isRulesLoading } = useQuery({
    queryKey: [ruleEngineAPI.getRulesEngine.endpointKey],
    queryFn: getRulesEngine,
    select: (response) => response.data.data,
  });

  // Handlers for Rules Engine
  const handleClickRule = (rule) => {
    setExistingRuleData(rule);
    setIsJDMEditorOpen(true);
  };

  return (
    <Wrapper>
      <RulesEngineHeader
        isEditorOpen={isJDMEditorOpen}
        onCreateRule={() => setIsJDMEditorOpen(true)}
      />

      {/* Rules Engine - JDM Editor Mode */}
      {isJDMEditorOpen && (
        <JdmEditor
          queryClient={queryClient}
          onCancel={() => {
            setExistingRuleData(null);
            setIsJDMEditorOpen(false);
          }}
          existingRuleData={existingRuleData}
        />
      )}

      {/* Rules Engine - BRE Decision Rules List */}
      {!isJDMEditorOpen && (
        <div className="pb-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {isRulesLoading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <Card key={key} className="space-y-3 p-4">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                </Card>
              ))}
            </div>
          )}

          {!isRulesLoading && rules.length === 0 && (
            <div style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
              <EmptyStageComponent
                heading="No Rules Engine"
                subHeading="Click the button below to create a new Rule Engine"
                actionBtn={
                  <button
                    type="button"
                    onClick={() => setIsJDMEditorOpen(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm"
                  >
                    <GitGraph size={16} />
                    Create Rule Engine
                  </button>
                }
              />
            </div>
          )}

          {!isRulesLoading && rules.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rules.map((rule) => {
                const ruleName = rule?.ruleName || 'Rule';
                const contextLabel = rule?.context?.context ?? '-';
                const createdAt =
                  moment(rule?.createdAt).format('MMM D, YYYY h:mm A') ?? '-';

                return (
                  <Card
                    key={rule?.id}
                    className="flex h-full cursor-pointer flex-col gap-4 p-4 hover:border-primary"
                    onClick={() => handleClickRule(rule)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <GitGraph className="h-5 w-5" />
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ExternalLink size={16} />
                      </div>
                    </div>

                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {ruleName}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Context: {contextLabel}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created At: {createdAt}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
}
