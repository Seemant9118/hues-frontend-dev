'use client';

import { qcApis } from '@/api/inventories/qc/qc';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  getQCDetails,
  updateQC,
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
  const [item, setItem] = useState(null);

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
    queryKey: [qcApis.getQCDetails.endpointKey, params.id],
    queryFn: () => getQCDetails({ id: params.id }),
    select: (res) => res.data.data,
    enabled: true,
  });

  useEffect(() => {
    if (!qcDetails) return;

    setItem({
      id: qcDetails.id,
      skuId: qcDetails.metaData?.productDetails?.skuId,
      productName: qcDetails.metaData?.productDetails?.productName,
      totalQuantity: qcDetails.totalQuantity,
      qcStatus: qcDetails.qcStatus || 'QC_PENDING',
      remarks: qcDetails.qcRemarks || '',
      acceptedQty: qcDetails.qcPassedQuantity || 0,
      rejectedQty: qcDetails.qcFailedQuantity || 0,
      isShortQuantity: false,
    });
  }, [qcDetails]);

  const updateItemField = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
  };

  const updateQCMutation = useMutation({
    mutationFn: updateQC,
    onSuccess: () => {
      toast.success('QC updated successfully');
      queryClient.invalidateQueries([
        qcApis.getQCDetails.endpointKey,
        params.id,
      ]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleUpdateInventory = () => {
    if (!item) {
      toast.info('No data to update');
      return;
    }

    const qcCompletedQuantity =
      Number(item.acceptedQty || 0) + Number(item.rejectedQty || 0);

    if (qcCompletedQuantity > item.totalQuantity) {
      toast.error('Accepted and rejected quantities exceed received quantity');
      return;
    }

    const payload = {
      id: item.id,
      qcCompletedQuantity,
      qcPassedQuantity: Number(item.acceptedQty || 0),
      qcFailedQuantity: Number(item.rejectedQty || 0),
      qcRemarks: item.remarks || '',
    };

    updateQCMutation.mutate({
      id: params.id,
      data: payload,
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
            {/* Table */}
            <div className="overflow-x-auto">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Sr.</TableHead>
                    <TableHead>SKU ID</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Qty Received</TableHead>
                    <TableHead>Qty Accepted</TableHead>
                    <TableHead>Qty Rejected</TableHead>
                    {/* <TableHead>QC Status</TableHead> */}
                    <TableHead>Remark</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {!item ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={item.id}>
                      <TableCell>1</TableCell>

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
                        <Input
                          type="number"
                          min={0}
                          max={item.totalQuantity}
                          value={item.acceptedQty}
                          onChange={(e) =>
                            updateItemField(
                              'acceptedQty',
                              Number(e.target.value),
                            )
                          }
                          className="w-[100px]"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={item.totalQuantity}
                          value={item.rejectedQty}
                          onChange={(e) =>
                            updateItemField(
                              'rejectedQty',
                              Number(e.target.value),
                            )
                          }
                          className="w-[100px]"
                        />
                      </TableCell>

                      {/* <TableCell>{item.qcStatus ?? '-'}</TableCell> */}

                      <TableCell>
                        <Input
                          placeholder="Add remark..."
                          value={item.remarks}
                          onChange={(e) =>
                            updateItemField('remarks', e.target.value)
                          }
                          className="max-w-[220px]"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setItem(null);
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
