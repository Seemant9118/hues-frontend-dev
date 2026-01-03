import { useBuyerSellerColumns } from '@/app/[locale]/(dashboard)/dashboard/sales/sales-debitNotes/[debit_id]/useBuyerSellerMergedColumns';
import { createCreditNote } from '@/services/Credit_Note_Services/CreditNoteServices';
import { useMutation } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MergerDataTable } from '../table/merger-data-table';
import { Button } from '../ui/button';
import { DynamicTextInfo } from '../ui/dynamic-text-info';
import Loading from '../ui/Loading';
import Wrapper from '../wrappers/Wrapper';

const CreateCreditNote = ({ isCreatingCreditNote, data = [], id, onClose }) => {
  const router = useRouter();
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const normalizeItems = (data = []) =>
    data.map((item) => {
      return {
        ...item,
        isSelected: false,
      };
    });
  /* Normalize API Data */
  const [items, setItems] = useState(() => normalizeItems(data));
  const [errorMsg, setErrorMsg] = useState(null);

  //   helper fn
  const groupByDebitNoteItemId = (items = []) => {
    return items.reduce((acc, item) => {
      const key = item.debitNoteItemId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  useEffect(() => {
    if (!isCreatingCreditNote) return;

    setErrorMsg(null);
    setItems(normalizeItems(data));
  }, [isCreatingCreditNote, data]);

  // create debit note mutation
  const createCreditNoteMutation = useMutation({
    mutationFn: createCreditNote,
    onSuccess: (res) => {
      setErrorMsg(null);
      toast.success('Credit Note Created');
      router.push(`/dashboard/sales/sales-creditNotes/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleCreateCreditNote = () => {
    // Buyer rows selected
    const selectedBuyerRows = items.filter(
      (item) => item._isFirstRow && selectedRowIds.includes(item.rowId),
    );

    if (!selectedBuyerRows.length) {
      setErrorMsg('Please select at least 1 item to proceed');
      return;
    }

    setErrorMsg(null);

    // Expand to all rows of same debitNoteItemId
    const expandedSelectedItems = items.filter((item) =>
      selectedBuyerRows.some(
        (buyer) => buyer.debitNoteItemId === item.debitNoteItemId,
      ),
    );

    // Group by debitNoteItemId
    const groupedItems = groupByDebitNoteItemId(expandedSelectedItems);

    let approvedQuantity = 0;
    let approvedAmount = 0;
    let rejectedQuantity = 0;
    let replacementQuantity = 0;
    const taxAmount = 0;

    const itemsIds = [];

    Object.entries(groupedItems).forEach(([debitNoteItemId, rows]) => {
      itemsIds.push(Number(debitNoteItemId));

      rows.forEach((row) => {
        const qty = Number(row.sellerQty) || 0;

        switch (row.sellerResponse) {
          case 'ACCEPTED':
            approvedQuantity += qty;
            approvedAmount += Number(row.sellerAmount) || 0;
            break;

          case 'REJECTED':
            rejectedQuantity += qty;
            break;

          case 'REPLACEMENT':
            replacementQuantity += qty;
            break;

          default:
            break;
        }
      });
    });

    const payload = {
      itemsIds,
      approvedAmount,
      approvedQuantity,
      taxAmount,
      rejectedQuantity,
      replacementQuantity,
    };

    createCreditNoteMutation.mutate({ id, data: payload });
  };

  const buyerSellerColumns = useBuyerSellerColumns();

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

            <MergerDataTable
              id="buyer-seller-table"
              columns={buyerSellerColumns}
              data={items}
              enableSelection
              selectedRowIds={selectedRowIds}
              onSelectionChange={setSelectedRowIds}
            />
          </div>
        </div>
      </section>
      {/* Footer */}
      <div className="sticky bottom-0 z-20 flex w-full justify-end gap-2 border-t-2 bg-white p-2">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleCreateCreditNote}
          disabled={createCreditNoteMutation?.isPending}
        >
          {createCreditNoteMutation?.isPending ? (
            <Loading />
          ) : (
            'Confirm & Create Credit Note'
          )}
        </Button>
      </div>
    </Wrapper>
  );
};

export default CreateCreditNote;
