'use client';

import { qcApis } from '@/api/inventories/qc/qc';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Overview from '@/components/ui/Overview';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  getQCDetailsWithGRNs,
  updateBulkQc,
} from '@/services/Inventories_Services/QC_Services/QC_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ViewQC = () => {
  const translations = useTranslations('qc.qcDetails');
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('overview');
  const [items, setItems] = useState(null);

  const itemsBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/inventory/qc',
      show: true, // Always show
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/inventory/qc/${params.id}`,
      show: true, // Always show
    },
  ];

  const onTabChange = (tab) => {
    setTab(tab);
  };

  // item details fetching
  const { data: qcDetails } = useQuery({
    queryKey: [qcApis.getQCDetailsWithGRNs.endpointKey, params.id],
    queryFn: () => getQCDetailsWithGRNs({ id: params.id }),
    select: (res) => res.data.data,
    enabled: true,
  });

  const overviewData = {
    grnID: qcDetails?.items?.[0]?.grn?.referenceNumber || '-',
    invoiceId:
      qcDetails?.items?.[0]?.grn?.metaData?.invoiceDetails?.referenceNumber ||
      '-',
    vendorName:
      qcDetails?.items?.[0]?.grn?.metaData?.sellerDetails?.name || '-',
    status: qcDetails?.parentStatus || '-',
  };
  const overviewLabels = {
    grnID: translations('overview.labels.grnId'),
    invoiceId: translations('overview.labels.invoiceId'),
    vendorName: translations('overview.labels.vendorName'),
    status: translations('overview.labels.status'),
  };

  useEffect(() => {
    if (!qcDetails?.items?.length) return;

    const mappedItems = qcDetails.items.map((item) => ({
      id: item.id,
      skuId: item.metaData?.productDetails?.skuId,
      productName: item.metaData?.productDetails?.productName,
      totalQuantity: item.totalQuantity,
      qcStatus: item.qcStatus || 'QC_PENDING',
      qcResult: item.qcResult,
      remarks: item.qcRemarks || '',
      acceptedQty: item.qcPassedQuantity || 0,
      rejectedQty: item.qcFailedQuantity || 0,
      pendingQty: item.qcPendingQuantity || 0,
      isShortQuantity: item.qcStatus === 'SHORT_QUANTITY',
    }));

    setItems(mappedItems);
  }, [qcDetails]);

  const updateItemField = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        // TEXT FIELD (remarks)
        if (field === 'remarks') {
          return {
            ...item,
            remarks: value,
          };
        }

        // NUMBER FIELDS (acceptedQty / rejectedQty)
        const numericValue = Math.max(0, Number(value) || 0);

        const otherQty =
          field === 'acceptedQty'
            ? item.rejectedQty || 0
            : item.acceptedQty || 0;

        const maxAllowed = Math.max(0, (item.totalQuantity || 0) - otherQty);

        const finalValue = Math.min(numericValue, maxAllowed);

        return {
          ...item,
          [field]: finalValue,
        };
      }),
    );
  };

  const updateQCMutation = useMutation({
    mutationFn: updateBulkQc,
    onSuccess: () => {
      toast.success('QC updated successfully');
      queryClient.invalidateQueries([
        qcApis.getQCDetailsWithGRNs.endpointKey,
        params.id,
      ]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleUpdateInventory = () => {
    if (!items.length) {
      toast.info('No data to update');
      return;
    }

    const hasInvalidQuantity = items.some((item) => {
      const qcCompletedQuantity =
        Number(item.acceptedQty || 0) + Number(item.rejectedQty || 0);

      return qcCompletedQuantity > item.totalQuantity;
    });

    if (hasInvalidQuantity) {
      toast.error('Accepted + rejected quantity exceeds received quantity');
      return;
    }

    const payload = items.map((item) => {
      const qcCompletedQuantity =
        Number(item.acceptedQty || 0) + Number(item.rejectedQty || 0);

      return {
        id: item.id,
        qcCompletedQuantity,
        qcPassedQuantity: Number(item.acceptedQty || 0),
        qcFailedQuantity: Number(item.rejectedQty || 0),
        qcRemarks: item.remarks || '',
      };
    });

    updateQCMutation.mutate({
      id: params.id,
      data: { items: payload }, // ✅ array of objects
    });
  };

  return (
    <ProtectedWrapper permissionCode={'permission:item-masters-view'}>
      <Wrapper className="h-full py-2">
        {/* Headers */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/dashboard/inventory/qc`)}
              className="rounded-sm p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={16} />
            </button>
            {/* breadcrumbs */}
            <OrderBreadCrumbs possiblePagesBreadcrumbs={itemsBreadCrumbs} />
          </div>
        </section>

        {/* Content */}
        <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
          <TabsList className="border">
            <TabsTrigger value="overview">
              {translations('tabs.tab1.title')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Overview
              collapsible={tab !== 'overview'}
              data={overviewData}
              labelMap={overviewLabels}
              isQC={true}
            />

            {/* Table */}
            <h1 className="font-semibold">Items</h1>
            <div className="overflow-x-auto">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU ID</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Qty Received</TableHead>
                    <TableHead>Qty Accepted</TableHead>
                    <TableHead>Qty Rejected</TableHead>
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {!items?.length ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.skuId || '-'}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">
                              {item.productName || '-'}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>{item.totalQuantity ?? '-'}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              debounceTime={0}
                              disabled={item.acceptedQty <= 0}
                              onClick={() =>
                                updateItemField(
                                  item.id,
                                  'acceptedQty',
                                  item.acceptedQty - 1,
                                )
                              }
                            >
                              −
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              max={item.totalQuantity}
                              value={item.acceptedQty}
                              onChange={(e) =>
                                updateItemField(
                                  item.id,
                                  'acceptedQty',
                                  Number(e.target.value),
                                )
                              }
                              className="w-[100px]"
                            />

                            <Button
                              variant="outline"
                              size="sm"
                              debounceTime={0}
                              disabled={
                                item.acceptedQty + item.rejectedQty >=
                                item.totalQuantity
                              }
                              onClick={() =>
                                updateItemField(
                                  item.id,
                                  'acceptedQty',
                                  item.acceptedQty + 1,
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              debounceTime={0}
                              disabled={item.rejectedQty <= 0}
                              onClick={() =>
                                updateItemField(
                                  item.id,
                                  'rejectedQty',
                                  item.rejectedQty - 1,
                                )
                              }
                            >
                              −
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              max={item.totalQuantity}
                              value={item.rejectedQty}
                              onChange={(e) =>
                                updateItemField(
                                  item.id,
                                  'rejectedQty',
                                  Number(e.target.value),
                                )
                              }
                              className="w-[100px]"
                            />

                            <Button
                              variant="outline"
                              size="sm"
                              debounceTime={0}
                              disabled={
                                item.acceptedQty + item.rejectedQty >=
                                item.totalQuantity
                              }
                              onClick={() =>
                                updateItemField(
                                  item.id,
                                  'rejectedQty',
                                  item.rejectedQty + 1,
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Input
                            placeholder="Add remark..."
                            value={item.remarks}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                'remarks',
                                e.target.value,
                              )
                            }
                            className="max-w-[220px]"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setItems(null);
                  router.push('/dashboard/inventory/qc');
                }}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={handleUpdateInventory}
                disabled={updateQCMutation.isLoading}
              >
                Update Inventory
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewQC;
