import { raisedDebitNote } from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DynamicTextInfo } from '../ui/dynamic-text-info';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import Wrapper from '../wrappers/Wrapper';

const CreateDebitNote = ({
  isCreatingDebitNote,
  setIsCreatingDebitNote,
  data = [],
  id,
}) => {
  const router = useRouter();

  const normalizeItems = (data = []) =>
    data.map((item) => {
      const product = item.metaData?.productDetails || {};

      const defectQty = item.defectedQuantity;
      const remainingDefectedQty = item.remainingDefectedQuantity;
      const isUnsatisfactory = item.issueType === 'UNSATISFACTORY';
      const isShortQuantity = item.issueType === 'SHORT_QUANTITY';

      return {
        id: item?.invoiceItem?.id,
        skuId: product.skuId,
        itemName: product.productName,
        price: Number(product.salesPrice || 0),
        isUnsatisfactory,
        isShortQuantity,
        defectQty: remainingDefectedQty || defectQty,
        quantity: remainingDefectedQty || defectQty,
        issueType: item.issueType, // SHORT_QUANTITY | UNSATISFACTORY
        isSelected: false,
      };
    });
  /* Normalize API Data */
  const [items, setItems] = useState(() => normalizeItems(data));
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isCreatingDebitNote) return;

    setErrorMsg(null);
    setItems(normalizeItems(data));
  }, [isCreatingDebitNote, data]);

  const isAllSelected = items.every((item) => item.isSelected);

  const toggleSelectAll = () => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, isSelected: !isAllSelected })),
    );
  };

  const toggleItemSelection = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isSelected: !item.isSelected } : item,
      ),
    );
  };

  const updateItemQty = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const quantity = Math.max(
          0,
          Math.min(Number(value) || 0, item.defectQty),
        );

        return {
          ...item,
          quantity,
        };
      }),
    );
  };

  // create debit note mutation
  const createDebitNoteMutation = useMutation({
    mutationFn: raisedDebitNote,
    onSuccess: (res) => {
      setErrorMsg(null);
      toast.success('Debit Note Created');
      router.push(
        `/dashboard/purchases/purchase-debitNotes/${res.data.data.debitNote.id}`,
      );
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleCreateDebitNote = () => {
    const selectedItems = items
      .filter((item) => item.isSelected)
      .map((item) => ({
        id: item?.id,
        quantityToProcessed: item?.quantity,
        isUnsatisfactory: item?.isUnsatisfactory,
        isShortQuantity: item?.isShortQuantity,
      }));

    if (!selectedItems.length) {
      setErrorMsg('Please select atleast 1 item to proceed');
      return;
    }

    setErrorMsg(null);

    const payload = {
      invoiceId: id,
      items: selectedItems,
    };

    createDebitNoteMutation.mutate(payload);
  };

  return (
    <Wrapper className="flex h-screen flex-col">
      <section className="flex flex-1 flex-col overflow-hidden">
        {/* Scrollable Content */}
        <div className="scrollBarStyles flex-1 overflow-auto">
          {/* Items Table */}
          <div className="rounded-sm p-2">
            <div className="flex items-center gap-2 border-b pb-2 font-semibold">
              <Package size={18} />
              Select Items to Create Debit note
            </div>
            {errorMsg && <DynamicTextInfo variant="danger" title={errorMsg} />}

            <Table className="w-full text-sm">
              <TableHeader className="sticky top-0 bg-muted/40 text-left">
                <TableRow>
                  <TableHead className="p-3">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="p-3">SKU ID</TableHead>
                  <TableHead className="p-3">Item Name</TableHead>
                  <TableHead className="p-3">Defects</TableHead>
                  <TableHead className="p-3">Short/Rejected Qty.</TableHead>
                  <TableHead className="p-3">Quantity</TableHead>
                  <TableHead className="p-3">Price</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id} className="border-b">
                    <TableCell className="p-3">
                      <Checkbox
                        checked={item.isSelected}
                        onCheckedChange={() => {
                          toggleItemSelection(index);
                        }}
                        aria-label="Select all"
                      />
                    </TableCell>
                    <TableCell className="p-3">{item.skuId}</TableCell>
                    <TableCell className="p-3 font-medium">
                      {item.itemName}
                    </TableCell>
                    <TableCell className="p-3">
                      <ConditionalRenderingStatus
                        status={item.issueType}
                        isQC
                      />
                    </TableCell>
                    <TableCell className="p-3 font-medium">
                      {item.defectQty}
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          debounceTime={0}
                          disabled={item.quantity <= 0}
                          onClick={() =>
                            updateItemQty(index, item.quantity - 1)
                          }
                        >
                          −
                        </Button>

                        <Input
                          type="number"
                          className="w-20 text-center"
                          min={0}
                          max={item.defectQty}
                          value={item.quantity}
                          onChange={(e) => updateItemQty(index, e.target.value)}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          debounceTime={0}
                          disabled={item.quantity >= item.defectQty}
                          onClick={() =>
                            updateItemQty(index, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="p-3">₹{item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
      {/* Footer */}
      <div className="sticky bottom-0 z-20 flex w-full justify-end gap-2 border-t-2 bg-white p-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsCreatingDebitNote(false)}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleCreateDebitNote}
          disabled={createDebitNoteMutation?.isPending}
        >
          {createDebitNoteMutation?.isPending ? (
            <Loading />
          ) : (
            'Confirm & Create Debit Note'
          )}
        </Button>
      </div>
    </Wrapper>
  );
};

export default CreateDebitNote;
