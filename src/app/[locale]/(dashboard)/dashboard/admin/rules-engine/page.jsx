'use client';

import { ruleEngineAPI } from '@/api/rule-engine-apis/ruleEngineAPI';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
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

export default function RulesEngine() {
  const queryClient = useQueryClient();
  const [isJDMEditorOpen, setIsJDMEditorOpen] = useState(false);
  const [existingRuleData, setExistingRuleData] = useState(null);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: [ruleEngineAPI.getRulesEngine.endpointKey],
    queryFn: getRulesEngine,
    select: (response) => response.data.data,
  });

  const rulesEngineBreadCrumbs = [
    {
      id: 1,
      name: 'Rules Engine',
      path: '/dashboard/admin/rules-engine/',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Create Rule Engine',
      path: '/dashboard/admin/rules-engine/create',
      show: isJDMEditorOpen, // Always show
    },
  ];

  const skeletonCards = [
    'skeleton-1',
    'skeleton-2',
    'skeleton-3',
    'skeleton-4',
    'skeleton-5',
    'skeleton-6',
  ];

  const handleClickRule = (rule) => {
    setExistingRuleData(rule);
    setIsJDMEditorOpen(true);
  };

  return (
    <Wrapper>
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white pb-2 pt-4">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={rulesEngineBreadCrumbs} />

        <div className="flex items-center gap-2">
          {!isJDMEditorOpen && (
            <Button size="sm" onClick={() => setIsJDMEditorOpen(true)}>
              <GitGraph size={16} />
              Create Rule Engine
            </Button>
          )}
        </div>
      </div>
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
      {!isJDMEditorOpen && (
        <div className="pb-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {skeletonCards.map((key) => (
                <Card key={key} className="p-4">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                  <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                </Card>
              ))}
            </div>
          )}

          {!isLoading && rules.length === 0 && (
            <div style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
              <EmptyStageComponent
                heading="No Rules Engine"
                subHeading="Click the button below to create a new Rule Engine"
                actionBtn={
                  <Button size="sm" onClick={() => setIsJDMEditorOpen(true)}>
                    <GitGraph size={16} />
                    Create Rule Engine
                  </Button>
                }
              />
            </div>
          )}

          {!isLoading && rules.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rules.map((rule) => {
                const ruleName = rule?.ruleName || 'Rule';
                const contextLabel = rule?.context?.context ?? '-';
                const createdAt =
                  moment(rule?.createdAt).format('MMM D, YYYY h:mm A') ?? '-';

                return (
                  <Card
                    key={rule?.id}
                    title="Click to view"
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
