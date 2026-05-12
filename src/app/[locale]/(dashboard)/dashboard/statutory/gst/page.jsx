'use client';

import { gstAPIs } from '@/api/gstAPI/gstApi';
import {
  getCurrentFinancialYearPeriods,
  getEnterpriseId,
} from '@/appUtils/helperFunctions';
import ActionsDropdown from '@/components/deliveryManagement/ActionsDropdown';
import { PrepareGstrModal } from '@/components/statutory/PrepareGSTModal';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService } from '@/lib/utils';
import { filedGsts } from '@/services/GST_Services/GST_Services';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Calendar, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useGstColumns } from './useGstColumns';

const PAGE_LIMIT = 10;

const GST = () => {
  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const currentFinancialPeriod = getCurrentFinancialYearPeriods();
  const translations = useTranslations('gsts');

  const router = useRouter();
  const { hasPermission } = usePermission();

  // States
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending' or 'filled'
  const [gsts, setGsts] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [preparingGst, setPreparingGst] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(
    currentFinancialPeriod[0]?.value || '',
  );

  //   get filed gsts
  const gstsQuery = useInfiniteQuery({
    queryKey: [gstAPIs.filedGsts.endpointKey, statusFilter, selectedPeriod],
    queryFn: async ({ pageParam = 1 }) => {
      const isFiled =
        statusFilter === 'all' ? undefined : statusFilter === 'filled';
      return filedGsts({
        page: pageParam,
        limit: PAGE_LIMIT,
        retPeriod: selectedPeriod,
        isFiled,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      const lastPageData = _lastGroup?.data?.data || [];
      return lastPageData.length === PAGE_LIMIT ? nextPage : undefined;
    },
    enabled: hasPermission('permission:item-masters-view'),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const source = gstsQuery.data;

    if (!source?.pages?.length) return;

    const flattened = source.pages.flatMap((page) => page?.data?.data || []);
    const uniqueQCListData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setGsts(uniqueQCListData);

    const lastPageData =
      source.pages[source.pages.length - 1]?.data?.data || [];

    setPaginationData({
      totalPages:
        source.pages.length + (lastPageData.length === PAGE_LIMIT ? 1 : 0),
      currFetchedPage: source.pages.length,
    });
  }, [gstsQuery.data]);

  const gstColumns = useGstColumns();

  // Summary counts (for currently loaded data)
  // const stats = useMemo(() => {
  //   return {
  //     pending: statusFilter === 'pending' ? gsts.length : 0,
  //     filed: statusFilter === 'filled' ? gsts.length : 0,
  //     overdue: 0, // Placeholder for future logic
  //     draft: 0, // Placeholder for future logic
  //   };
  // }, [gsts, statusFilter]);

  const currentPeriodLabel = useMemo(() => {
    return (
      currentFinancialPeriod.find((p) => p.value === selectedPeriod)?.label ||
      selectedPeriod
    );
  }, [selectedPeriod, currentFinancialPeriod]);

  return (
    <ProtectedWrapper permissionCode="permission:sales-view">
      {!enterpriseId || !isEnterpriseOnboardingComplete ? (
        <div className="flex flex-col gap-4 p-6">
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </div>
      ) : (
        <Wrapper>
          {/* Header Section */}
          <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <SubHeader name={translations('title')} />

              <p className="text-sm text-gray-500">
                {translations('description')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-sm border bg-white px-3 py-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {translations('labels.returnPeriod')}:
                </span>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="h-8 w-[140px] border-none p-0 font-semibold text-primary shadow-none focus:ring-0">
                    <SelectValue
                      placeholder={translations('labels.selectReturnPeriod')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {currentFinancialPeriod.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ActionsDropdown
                label={'Prepare'}
                variant="default"
                actions={[
                  {
                    key: 'gstr1',
                    label: 'GSTR-1',
                    onClick: () => {
                      setPreparingGst('gstr1');
                    },
                  },
                  {
                    key: 'gstr3b',
                    label: 'GSTR-3B',
                    onClick: () => {
                      setPreparingGst('gstr3b');
                    },
                  },
                ]}
              />
            </div>
          </header>

          {/* Summary Cards Section */}
          {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group relative overflow-hidden border-none bg-blue-50/50 shadow-sm transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Clock size={64} className="text-blue-600" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <Clock size={16} />
                  {translations('summary.pending')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-900">
                    {stats.pending}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border-none bg-blue-100 text-blue-700 hover:bg-blue-100"
                  >
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-none bg-green-50/50 shadow-sm transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <FileCheck size={64} className="text-green-600" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <FileCheck size={16} />
                  {translations('summary.filed')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-900">
                    {stats.filed}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border-none bg-green-100 text-green-700 hover:bg-green-100"
                  >
                    Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-none bg-orange-50/50 shadow-sm transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <AlertCircle size={64} className="text-orange-600" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-orange-700">
                  <AlertCircle size={16} />
                  {translations('summary.overdue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-900">
                    {stats.overdue}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border-none bg-orange-100 text-orange-700 hover:bg-orange-100"
                  >
                    Critical
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-none bg-gray-50/50 shadow-sm transition-all hover:shadow-md">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <FileText size={64} className="text-gray-600" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText size={16} />
                  {translations('summary.draft')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.draft}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border-none bg-gray-200 text-gray-700 hover:bg-gray-200"
                  >
                    Saved
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div> */}
          <div>
            <Tabs
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-fit"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">In Progress</TabsTrigger>
                <TabsTrigger value="filled">Filed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table Content */}
          <div className="flex min-h-[calc(100vh-150px)] flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm">
            {gstsQuery.isLoading ? (
              <div className="flex flex-grow items-center justify-center p-12">
                <Loading />
              </div>
            ) : (
              <>
                {gsts.length === 0 ? (
                  <div className="flex flex-grow flex-col items-center justify-center p-12 text-center">
                    <div className="mb-4 rounded-full bg-gray-50 p-6">
                      <FileText size={48} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {translations('emptyStateComponent.heading', {
                        period: currentPeriodLabel,
                      })}
                    </h3>
                    <p className="my-2 max-w-xs text-sm text-gray-500">
                      {translations('emptyStateComponent.description')}
                    </p>
                    <ActionsDropdown
                      label={'Prepare'}
                      variant="default"
                      actions={[
                        {
                          key: 'gstr1',
                          label: 'GSTR-1',
                          onClick: () => {
                            setPreparingGst('gstr1');
                          },
                        },
                        {
                          key: 'gstr3b',
                          label: 'GSTR-3B',
                          onClick: () => {
                            setPreparingGst('gstr3b');
                          },
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <InfiniteDataTable
                    id="gst-unified-table"
                    columns={gstColumns}
                    data={gsts}
                    fetchNextPage={gstsQuery.fetchNextPage}
                    isFetching={gstsQuery.isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                  />
                )}
              </>
            )}
          </div>

          {/* Preparing Modal */}
          {preparingGst && (
            <PrepareGstrModal
              open={!!preparingGst}
              onOpenChange={() => setPreparingGst(null)}
              type={preparingGst}
              onPrepare={(period, type) => {
                setPreparingGst(null);
                router.push(
                  `/dashboard/statutory/gst/${type}?period=${encodeURIComponent(period)}`,
                );
              }}
            />
          )}
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
};

export default GST;
