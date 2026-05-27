'use client';

import {
  capitalize,
  convertSnakeToTitleCase,
  formatDate,
  formattedAmount,
} from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Badge } from '@/components/ui/badge';
import Overview from '@/components/ui/Overview';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimelineItem from '@/components/ui/TimelineItem';
import Wrapper from '@/components/wrappers/Wrapper';
import { useParams, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

const parseEntryFromQuery = (entry) => {
  if (!entry) return null;

  try {
    const binary = atob(entry);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded);
  } catch (_error) {
    return null;
  }
};

const toPercent = ({ expectedAmount, realizedAmount }) => {
  const expected = Number(expectedAmount || 0);
  const realized = Number(realizedAmount || 0);
  if (!expected || expected <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((realized / expected) * 100)));
};

export default function CashFlowEntryDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  const entry = useMemo(
    () => parseEntryFromQuery(searchParams.get('entry')),
    [searchParams],
  );

  const detailTab = searchParams.get('tab') || 'impending';
  const isActual = detailTab === 'actual';
  const breadcrumbData = [
    {
      id: 1,
      name: isActual ? 'Actual Registers' : 'Impending Registers',
      path: '/dashboard/accounting/cash-flow',
      show: true,
    },
    {
      id: 2,
      name: isActual ? `Actual Event: #${id}` : `Impending Event : #${id}`,
      path: `/dashboard/accounting/cash-flow/${id}`,
      show: true,
    },
  ];

  const overviewData = isActual
    ? {
        direction: (
          <Badge variant="secondary">{capitalize(entry?.flowDirection)}</Badge>
        ),
        date: formatDate(entry?.actualDate || entry?.expectedDate),
        classification: convertSnakeToTitleCase(entry?.flowCategory),
        eventStatus: capitalize(entry?.status),
        amount: (
          <span className="text-emerald-700">
            {formattedAmount(
              entry?.transactionAmount || entry?.grossAmount || 0,
            )}
          </span>
        ),
        source: entry?.sourceType
          ? `${capitalize(entry?.sourceType)}${entry?.referenceNumber ? ` (${entry?.referenceNumber})` : ''}`
          : '--',

        counterparty:
          entry?.counterpartyName ||
          entry?.customerName ||
          entry?.vendorName ||
          entry?.partyName ||
          '--',
      }
    : {
        expectedDate: formatDate(entry?.expectedDate || entry?.actualDate),
        direction: (
          <Badge variant="secondary">{capitalize(entry?.flowDirection)}</Badge>
        ),
        classification: convertSnakeToTitleCase(entry?.flowCategory),
        eventStatus: capitalize(entry?.status),
      };

  const sourceContextData = isActual
    ? {
        bankAccount:
          entry?.bankAccountName ||
          entry?.bankAccountNumber ||
          entry?.bankName ||
          '--',
        referenceUtr:
          entry?.referenceNumber ||
          entry?.utrNumber ||
          entry?.idempotencyKey ||
          '--',
        mode:
          convertSnakeToTitleCase(entry?.mode) ||
          convertSnakeToTitleCase(entry?.paymentMode) ||
          '--',
        narration: entry?.narration || entry?.description || '--',
      }
    : {
        documentType: convertSnakeToTitleCase(entry?.sourceType),
        source: entry?.sourceType
          ? `${capitalize(entry?.sourceType)}${entry?.referenceNumber ? ` (${entry?.referenceNumber})` : ''}`
          : '--',
        module: 'Accounting',
        counterparty:
          entry?.counterpartyName ||
          entry?.customerName ||
          entry?.vendorName ||
          entry?.partyName ||
          '--',
        basis: convertSnakeToTitleCase(entry?.eventType),
        contracted: (
          <span className="text-emerald-700">
            {formattedAmount(
              entry?.grossAmount || entry?.transactionAmount || 0,
            )}
          </span>
        ),
      };

  const expectedAmount = Number(
    entry?.transactionAmount || entry?.grossAmount || 0,
  );
  const realizedAmount = Number(entry?.settledAmount || 0);
  const residualAmount = Number(entry?.outstandingAmount || 0);
  const progress = toPercent({ expectedAmount, realizedAmount });

  const timelineItems = [
    {
      action: 'CREATE_ORDER',
      module: entry?.sourceType || 'CASH_FLOW',
      details: {
        amount: entry?.transactionAmount || entry?.grossAmount || 0,
        note: entry?.idempotencyKey || '--',
      },
      dateTime: entry?.createdAt,
    },
    {
      action: entry?.eventType || 'UPDATE_ORDER',
      module: entry?.flowCategory || 'CASH_FLOW',
      details: {
        amount: entry?.grossAmount || entry?.transactionAmount || 0,
        note: entry?.status || '--',
      },
      dateTime: entry?.expectedDate || entry?.createdAt,
    },
    {
      action: 'PAYMENT',
      module: entry?.sourceType || 'CASH_FLOW',
      details: {
        amount: entry?.settledAmount || 0,
        note: entry?.updatedAt
          ? `Updated ${formatDate(entry?.updatedAt)}`
          : '--',
      },
      dateTime: entry?.actualDate || entry?.updatedAt || entry?.createdAt,
    },
  ];

  if (!entry) {
    return (
      <Wrapper className="h-full py-2">
        <section className="py-2">
          <OrderBreadCrumbs possiblePagesBreadcrumbs={breadcrumbData} />
        </section>
        <section className="rounded-md border p-4 text-sm text-gray-600">
          Entry payload is missing or invalid for ID: {id}
        </section>
      </Wrapper>
    );
  }

  return (
    <Wrapper className="h-full py-2">
      <section className="py-2">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={breadcrumbData} />
      </section>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="overview"
      >
        <TabsList className="border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="event-lineage">
            Event Lineage (Timeline)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3 space-y-3">
          <Overview
            data={overviewData}
            labelMap={
              isActual
                ? {
                    amount: 'Amount',
                    direction: 'Direction',
                    date: 'Date',
                    classification: 'Classification',
                    eventStatus: 'Status',
                    source: 'Source',
                    bankAccount: 'Bank Account',
                    counterparty: 'Counterparty',
                  }
                : {
                    expectedDate: 'Expected Date',
                    direction: 'Direction',
                    expectedAmount: 'Expected Amt',
                    realizedAmount: 'Realized Amt',
                    residual: 'Residual',
                    classification: 'Classification',
                    source: 'Source',
                    basis: 'Basis',
                    eventStatus: 'Status',
                    actions: 'Actions',
                  }
            }
            customRender={{
              eventStatus: (value) => (
                <ConditionalRenderingStatus status={value} className="w-fit" />
              ),
            }}
          />

          {isActual && (
            <p className="text-sm font-semibold text-gray-700">
              Bank Transaction
            </p>
          )}

          <Overview
            data={sourceContextData}
            labelMap={
              isActual
                ? {
                    narration: 'Narration',
                    referenceUtr: 'Reference / UTR',
                    mode: 'Mode',
                  }
                : {
                    documentType: 'Document Type',
                    module: 'Module',
                    counterparty: 'Counterparty',
                    basis: 'Basis',
                    contracted: 'Contracted',
                  }
            }
          />

          {!isActual && (
            <section className="rounded-md border p-4">
              <p className="mb-3 text-sm font-semibold text-gray-600">
                Progress
              </p>
              <p className="mb-2 text-sm font-bold">{progress}%</p>
              <Progress value={progress} className="mb-4" />
              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold text-gray-600">
                    Expected
                  </p>
                  <p className="text-base font-bold">
                    {formattedAmount(expectedAmount)}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold text-gray-600">
                    Realized
                  </p>
                  <p className="text-base font-bold text-emerald-700">
                    {formattedAmount(realizedAmount)}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold text-gray-600">
                    Residual
                  </p>
                  <p className="text-base font-bold text-amber-700">
                    {formattedAmount(residualAmount)}
                  </p>
                </div>
              </section>
            </section>
          )}
        </TabsContent>

        <TabsContent value="event-lineage" className="mt-3">
          <section className="rounded-md border p-4">
            <section className="space-y-3">
              {timelineItems.map((item, index) => (
                <TimelineItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${item.action}-${index}`}
                  action={item.action}
                  module={item.module}
                  details={item.details}
                  dateTime={item.dateTime}
                  isLast={index === timelineItems.length - 1}
                />
              ))}
            </section>
          </section>
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}
