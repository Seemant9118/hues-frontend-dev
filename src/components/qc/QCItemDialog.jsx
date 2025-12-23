import { qcApis } from '@/api/inventories/qc/qc';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateBulkQc } from '@/services/Inventories_Services/QC_Services/QC_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import RemarkBox from '../remarks/RemarkBox';

export default function QCItemsDialog({ open, onClose, qcDetails }) {
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const [items, setItems] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

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

    saveQCMutation.mutate({
      id: params.id,
      data: { items: payload, remarks },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Quality Check Items</DialogTitle>
        </DialogHeader>

        {/* 👉 Your table goes here */}
        <div className="scrollBarStyles max-h-[70vh] overflow-auto">
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>SKU ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>QC Received</TableHead>
                  <TableHead>QC Accepted</TableHead>
                  <TableHead>QC Rejected</TableHead>
                  {/* <TableHead>Remark</TableHead> */}
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

                      {/* <TableCell>
                        <Input
                          placeholder="Add remark..."
                          value={item.remarks}
                          onChange={(e) =>
                            updateItemField(item.id, 'remarks', e.target.value)
                          }
                          className="max-w-[220px]"
                        />
                      </TableCell> */}
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
