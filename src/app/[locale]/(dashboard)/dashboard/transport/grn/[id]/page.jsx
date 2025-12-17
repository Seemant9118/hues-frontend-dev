'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import Tooltips from '@/components/auth/Tooltips';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Overview from '@/components/ui/Overview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  getGRN,
  previewGRN,
  updateStatusForQC,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const QC_STATUS_OPTIONS = [
  { label: 'Pending', value: 'QC_PENDING' },
  { label: 'Accepted', value: 'QC_OKAY' },
  { label: 'Rejected', value: 'QC_NOT_OKAY' },
];
export default function QC() {
  const translations = useTranslations('transport.grns.grnsDetails');
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const [tabs, setTabs] = useState('overview');
  const [items, setItems] = useState([]);
  const [updatedItemIds, setUpdatedItemIds] = useState(new Set());

  const grnsBreadCrumbs = [
    {
      id: 1,
      name: translations('title1'),
      path: '/dashboard/transport/grn',
      show: true,
    },
    {
      id: 2,
      name: translations('title2'),
      path: `/dashboard/transport/grn/${params.id}`,
      show: true,
    },
  ];

  const onTabChange = (tab) => {
    setTabs(tab);
  };

  const { data: grnDetails } = useQuery({
    queryKey: [deliveryProcess.getGRN.endpointKey],
    queryFn: () => getGRN({ id: params.id }),
    select: (data) => data.data.data,
  });
  useEffect(() => {
    if (grnDetails?.items?.length) {
      setItems(
        grnDetails.items.map((item) => ({
          id: item.id,
          skuId: item.metaData?.productDetails?.skuId,
          productName: item.metaData?.productDetails?.productName,
          dispatchedQuantity: item.dispatchedQuantity,
          isShortQuantity: item.isShortQuantity,
          qcStatus: item.status || 'QC_PENDING',
          remarks: item.remarks || '',
          acceptedQty: item.acceptedQuantity || 0,
          rejectedQty: item.rejectedQuantity || 0,
        })),
      );
    }
  }, [grnDetails]);

  const updateItemField = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );

    setUpdatedItemIds((prev) => new Set(prev).add(itemId));
  };

  const overviewData = {
    grnId: grnDetails?.referenceNumber,
    grnDate: moment(grnDetails?.createdAt).format('DD/MM/YYYY'),
    podId: grnDetails?.podReferenceNumber,
    invoiceId: grnDetails?.metaData?.invoiceDetails?.referenceNumber,
    invoiceDate:
      moment(grnDetails?.metaData?.invoiceDetails?.invoiceDate).format(
        'DD/MM/YYYY',
      ) || '-',
    deliveryDate: '-',
    EWB: grnDetails?.metaData?.invoiceDetails?.eWayBillId || '-',
  };
  const overviewLabels = {
    grnId: translations('overview_labels.grnId'),
    grnDate: translations('overview_labels.grnDate'),
    podId: translations('overview_labels.podId'),
    invoiceId: translations('overview_labels.invoiceId'),
    invoiceDate: translations('overview_labels.invoiceDate'),
    deliveryDate: translations('overview_labels.deliveryDate'),
    EWB: translations('overview_labels.EWB'),
  };

  const updateStatusForQCMutation = useMutation({
    mutationFn: updateStatusForQC,
    onSuccess: () => {
      toast.success('QC status updated successfully');
      queryClient.invalidateQueries([deliveryProcess.getGRN.endpointKey]);
      setUpdatedItemIds(new Set());
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleUpdateInventory = () => {
    const updatedItems = items.filter((item) => updatedItemIds.has(item.id));

    if (!updatedItems.length) {
      toast.info('No changes to update');
      return;
    }

    const payload = {
      items: updatedItems.map((item) => ({
        grnItemId: item.id,
        status: item.qcStatus, // already enum
        remarks: item.remarks,
        // acceptedQuantity: item.acceptedQty,
        // rejectedQuantity: item.rejectedQty,
      })),
    };

    updateStatusForQCMutation.mutate({
      id: params.id,
      data: payload,
    });
  };

  const previewGRNMutation = useMutation({
    mutationFn: previewGRN,
    onSuccess: async (data) => {
      toast.success('Document Generated Successfully');
      const pdfSlug = data?.data?.data?.grnDocumentSlug;

      viewPdfInNewTab(pdfSlug);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handlePreview = () => {
    if (grnDetails?.documentLink) {
      viewPdfInNewTab(grnDetails?.documentLink);
    } else {
      previewGRNMutation.mutate({
        id: params.id,
      });
    }
  };

  return (
    <Wrapper className="h-full py-2">
      {/* Header */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={grnsBreadCrumbs} />

        {/* preview */}
        <Tooltips
          trigger={
            <Button
              onClick={handlePreview}
              size="sm"
              variant="outline"
              className="font-bold"
            >
              <Eye size={14} />
            </Button>
          }
          content={'Preview GRN Document'}
        />
      </section>

      <Tabs value={tabs} onValueChange={onTabChange} defaultValue={'overview'}>
        <TabsList className="border">
          <TabsTrigger value="overview">
            {translations('tabs.tab1.title')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {/* OVERVIEW SECTION */}
          <Overview
            collapsible={false}
            data={overviewData}
            labelMap={overviewLabels}
          />
          {/* Table */}
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Sr.</TableHead>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Qty Received</TableHead>
                  {/* <TableHead >Qty Accepted</TableHead>
                                    <TableHead >Qty Rejected</TableHead> */}
                  <TableHead>QC Status</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell className="font-medium">
                      {item.skuId || '-'}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {item.productName || '-'}
                        </span>

                        {item.isShortQuantity && (
                          <Badge
                            variant="outline"
                            className="w-fit border-orange-300 bg-orange-50 text-orange-600"
                          >
                            ⚠ Short
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{item.dispatchedQuantity ?? '-'}</TableCell>

                    {/* QC Status */}
                    <TableCell>
                      <Select
                        value={item.qcStatus}
                        onValueChange={(value) =>
                          updateItemField(item.id, 'qcStatus', value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {QC_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Remark */}
                    <TableCell>
                      <Input
                        placeholder="Add remark..."
                        value={item.remarks}
                        onChange={(e) =>
                          updateItemField(item.id, 'remarks', e.target.value)
                        }
                        className="max-w-[220px]"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                router.push(`/dashboard/transport/grn/`);
                setItems([]);
              }}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleUpdateInventory}
              disabled={updateStatusForQCMutation.isLoading}
            >
              Update Inventory
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Wrapper>
  );
}
