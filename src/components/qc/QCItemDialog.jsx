import { qcApis } from '@/api/inventories/qc/qc';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getBuckets,
  updateBulkQc,
} from '@/services/Inventories_Services/QC_Services/QC_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import RemarkBox from '../remarks/RemarkBox';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export default function QCItemsDialog({
  enterpriseId,
  open,
  onClose,
  qcDetails,
}) {
  const queryClient = useQueryClient();
  const params = useSearchParams();

  const [items, setItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Fetch buckets
  const { data: bucketOptions = [], isLoading: isBucketLoading } = useQuery({
    queryKey: [qcApis.bucketOptions.endpointKey, enterpriseId],
    queryFn: () => getBuckets({ enterpriseId }),
    select: (res) => res?.data?.data || [],
    enabled: !!enterpriseId,
  });

  const allowedAcceptedBucketTypes = ['RAW_MATERIALS', 'FINISHED_GOODS'];
  const allowedRejectedBucketTypes = ['REJECTED'];

  const formattedAcceptedBucketOptions =
    (bucketOptions || [])
      .filter((b) => allowedAcceptedBucketTypes.includes(b.bucketType))
      .map((bucket) => ({
        value: bucket.id,
        label: bucket.displayName,
      })) || [];

  const formattedRejectedBucketOptions =
    (bucketOptions || [])
      .filter((b) => allowedRejectedBucketTypes.includes(b.bucketType))
      .map((bucket) => ({
        value: bucket.id,
        label: bucket.displayName,
      })) || [];

  // Map QC items
  useEffect(() => {
    if (!qcDetails?.items?.length) {
      setItems([]);
      return;
    }

    const mappedItems = qcDetails.items.map((item) => ({
      id: item.id,
      skuId: item.metaData?.productDetails?.skuId,
      productName: item.metaData?.productDetails?.productName,
      totalQuantity: item.totalQuantity,

      acceptedQty: item.qcPassedQuantity || 0,
      rejectedQty: item.qcFailedQuantity || 0,

      acceptedTargetBucketId: item.targetBucketId
        ? String(item.targetBucketId)
        : '',

      rejectedTargetBucketId: item.rejectedTargetBucketId
        ? String(item.rejectedTargetBucketId)
        : '',
    }));

    setItems(mappedItems);
  }, [qcDetails]);

  const updateItemField = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        // bucket manual selection
        if (
          field === 'acceptedTargetBucketId' ||
          field === 'rejectedTargetBucketId'
        ) {
          return { ...item, [field]: value };
        }

        const numericValue = Math.max(0, Number(value) || 0);

        const otherQty =
          field === 'acceptedQty'
            ? item.rejectedQty || 0
            : item.acceptedQty || 0;

        const maxAllowed = Math.max(0, item.totalQuantity - otherQty);

        const finalValue = Math.min(numericValue, maxAllowed);

        const updatedItem = {
          ...item,
          [field]: finalValue,
        };

        // Auto-select rejected bucket
        if (field === 'rejectedQty') {
          if (finalValue > 0 && formattedRejectedBucketOptions.length === 1) {
            updatedItem.rejectedTargetBucketId = String(
              formattedRejectedBucketOptions[0].value,
            );
          }

          if (finalValue === 0) {
            updatedItem.rejectedTargetBucketId = '';
          }
        }

        return updatedItem;
      }),
    );
  };
  const saveQCMutation = useMutation({
    mutationFn: updateBulkQc,
    onSuccess: () => {
      toast.success('QC added successfully');
      onClose();

      queryClient.invalidateQueries([
        qcApis.getQCDetailsWithGRNs.endpointKey,
        params.id,
      ]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSaveQC = () => {
    if (!items?.length) {
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

        targetBucketId: item.acceptedTargetBucketId
          ? Number(item.acceptedTargetBucketId)
          : null,

        rejectedTargetBucketId: item.rejectedTargetBucketId
          ? Number(item.rejectedTargetBucketId)
          : null,
      };
    });

    saveQCMutation.mutate({
      id: params.id,
      data: { items: payload, remarks },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Quality Check Items</DialogTitle>
        </DialogHeader>

        <div className="scrollBarStyles max-h-[70vh] overflow-auto">
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Item Received</TableHead>
                  <TableHead>QC Accepted</TableHead>
                  <TableHead>Accepted Bucket</TableHead>
                  <TableHead>QC Rejected</TableHead>
                  <TableHead>Rejected Bucket</TableHead>
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
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.skuId || '-'}
                      </TableCell>

                      <TableCell>{item.productName || '-'}</TableCell>

                      <TableCell>{item.totalQuantity ?? '-'}</TableCell>

                      {/* Accepted Qty */}
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
                            value={item.acceptedQty}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                'acceptedQty',
                                e.target.value,
                              )
                            }
                            className="w-[70px]"
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

                      {/* Accepted Bucket */}
                      <TableCell>
                        {item.acceptedQty > 0 ? (
                          <Select
                            value={item.acceptedTargetBucketId}
                            onValueChange={(value) =>
                              updateItemField(
                                item.id,
                                'acceptedTargetBucketId',
                                value,
                              )
                            }
                            disabled={isBucketLoading}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select Bucket" />
                            </SelectTrigger>

                            <SelectContent>
                              {formattedAcceptedBucketOptions.map((bucket) => (
                                <SelectItem
                                  key={bucket.value}
                                  value={String(bucket.value)}
                                >
                                  {bucket.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      {/* Rejected Qty */}
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
                            value={item.rejectedQty}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                'rejectedQty',
                                e.target.value,
                              )
                            }
                            className="w-[70px]"
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

                      {/* Rejected Bucket */}
                      <TableCell>
                        {item.rejectedQty > 0 ? (
                          <Select value={item.rejectedTargetBucketId} disabled>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Rejected Items" />
                            </SelectTrigger>

                            <SelectContent>
                              {formattedRejectedBucketOptions.map((bucket) => (
                                <SelectItem
                                  key={bucket.value}
                                  value={String(bucket.value)}
                                >
                                  {bucket.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-2">
            <RemarkBox
              remarks={remarks}
              setRemarks={setRemarks}
              attachedFiles={attachedFiles}
              setAttachedFiles={setAttachedFiles}
              isAttachmentDisabled={true}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button size="sm" onClick={handleSaveQC}>
            Save QC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
