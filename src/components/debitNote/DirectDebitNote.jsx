import { invoiceApi } from '@/api/invoice/invoiceApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { raisedDebitNote } from '@/services/Debit_Note_Services/DebitNoteServices';
import {
  getAllPurchaseInvoices,
  getItemsToCreateDebitNote,
} from '@/services/Invoice_Services/Invoice_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Package, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DynamicTextInfo } from '../ui/dynamic-text-info';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import Wrapper from '../wrappers/Wrapper';

const DirectDebitNote = ({ setIsCreatingDebitNote }) => {
  const router = useRouter();
  const enterpriseId = getEnterpriseId();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: invoicesData } = useQuery({
    queryKey: [invoiceApi.getAllPurchaseInvoices.endpointKey, debouncedSearch],
    queryFn: () =>
      getAllPurchaseInvoices({
        id: enterpriseId,
        data: {
          searchString: debouncedSearch,
          page: 1,
          limit: 10,
        },
      }),
    enabled: !!debouncedSearch,
    select: (res) => res.data.data,
  });

  const invoices = invoicesData?.data || [];

  const { data: invoiceDetails, isLoading } = useQuery({
    queryKey: [
      invoiceApi.getItemsToCreateDebitNote.endpointKey,
      selectedInvoiceId,
    ],
    queryFn: () => getItemsToCreateDebitNote({ id: selectedInvoiceId }),
    enabled: !!selectedInvoiceId,
    select: (res) => res.data.data,
  });

  const normalizeItems = (data = []) =>
    data.map((item) => {
      const product = item.metaData?.productDetails || item?.metaData || {};

      return {
        id: item?.invoiceItem?.id,
        skuId: product.skuId,
        itemName: product.productName,
        price: Number(product.salesPrice || 0),
        defectQty: item.remainingDefectedQuantity || item.defectedQuantity,
        quantity: item.remainingDefectedQuantity || item.defectedQuantity,
        issueType: item.issueType,
        isUnsatisfactory: item.issueType === 'UNSATISFACTORY',
        isShortQuantity: item.issueType === 'SHORT_QUANTITY',
        isSelected: true,
      };
    });

  useEffect(() => {
    if (!invoiceDetails) return;

    const defectiveItems = invoiceDetails || [];

    setItems(normalizeItems(defectiveItems));
  }, [invoiceDetails]);

  const isAllSelected = items.every((item) => item.isSelected);
  const selectedItemsCount = items.filter((item) => item.isSelected).length;
  const totalSelectedQuantity = items
    .filter((item) => item.isSelected)
    .reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const totalDefectQuantity = items.reduce(
    (acc, item) => acc + Number(item.defectQty || 0),
    0,
  );

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

        return { ...item, quantity };
      }),
    );
  };

  const createDebitNoteMutation = useMutation({
    mutationFn: raisedDebitNote,
    onSuccess: (res) => {
      toast.success('Debit Note Created');
      router.push(
        `/dashboard/purchases/purchase-debitNotes/${res.data.data.debitNote.id}`,
      );
    },
  });

  const handleCreateDebitNote = () => {
    if (!selectedInvoiceId) {
      setErrorMsg('Please select an invoice');
      return;
    }

    const selectedItems = items
      .filter((i) => i.isSelected)
      .map((i) => ({
        id: i.id,
        quantityToProcessed: i.quantity,
        isUnsatisfactory: i.isUnsatisfactory,
        isShortQuantity: i.isShortQuantity,
      }));

    if (!selectedItems.length) {
      setErrorMsg('Select at least 1 item');
      return;
    }

    createDebitNoteMutation.mutate({
      invoiceId: selectedInvoiceId,
      items: selectedItems,
    });
  };

  return (
    <Wrapper className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-slate-50/70 to-white">
      <div className="scrollBarStyles flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
        <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                Create Debit Note Directly
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Search a purchase invoice, review defective or short-delivered
                items, and create a debit note from the selected lines.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-lg border bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Items
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {items.length}
                </p>
              </div>

              <div className="rounded-lg border bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Selected
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedItemsCount}
                </p>
              </div>

              <div className="rounded-lg border bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Qty
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {totalSelectedQuantity}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed bg-slate-50/60 p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label className="text-sm font-semibold text-slate-900">
                Select Invoice <span className="text-red-500">*</span>
              </Label>

              {selectedInvoiceId && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Invoice Selected
                </span>
              )}
            </div>

            <Select
              value={selectedInvoiceId || undefined}
              onValueChange={(val) => setSelectedInvoiceId(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Search invoice..." />
              </SelectTrigger>

              <SelectContent>
                <div className="flex items-center gap-2 border-b p-2">
                  <Search size={14} className="text-muted-foreground" />
                  <Input
                    placeholder="Search invoice or vendor"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {invoices.map((inv) => (
                  <SelectItem key={inv.invoiceId} value={inv.invoiceId}>
                    {inv.invoiceReferenceNumber} ({inv.vendorName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {selectedInvoiceId &&
          (isLoading ? (
            <Loading />
          ) : items.length === 0 ? (
            <section className="rounded-xl border border-dashed bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                <div className="rounded-full bg-slate-100 p-3 text-slate-700">
                  <Package size={22} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No defective items found
                </h3>
                <p className="text-sm text-muted-foreground">
                  The selected invoice does not currently have any defective or
                  short quantity items available for a debit note.
                </p>
              </div>
            </section>
          ) : (
            <section className="rounded-xl border bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <div className="rounded-full bg-slate-100 p-2 text-slate-700">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-base">
                        Select Items to Create Debit Note
                      </p>
                      <p className="text-sm font-normal text-muted-foreground">
                        Review quantities before creating the debit note.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border bg-slate-50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Available Defects
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {totalDefectQuantity}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-slate-50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Selected Items
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedItemsCount}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-slate-50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Selected Qty
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {totalSelectedQuantity}
                      </p>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <DynamicTextInfo variant="danger" title={errorMsg} />
                )}
              </div>

              <div className="scrollBarStyles overflow-x-auto">
                <Table className="w-full min-w-[860px] text-sm">
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
                      <TableRow
                        key={item.id}
                        className="border-b transition-colors hover:bg-slate-50/60"
                      >
                        <TableCell className="p-3">
                          <Checkbox
                            checked={item.isSelected}
                            onCheckedChange={() => {
                              toggleItemSelection(index);
                            }}
                            aria-label="Select item"
                          />
                        </TableCell>

                        <TableCell className="p-3 font-medium text-slate-700">
                          {item.skuId || '--'}
                        </TableCell>

                        <TableCell className="max-w-[280px] p-3 font-medium text-slate-900">
                          <div className="truncate">{item.itemName}</div>
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
                              className="h-9 w-9 rounded-full p-0"
                              disabled={item.quantity <= 0}
                              onClick={() =>
                                updateItemQty(index, item.quantity - 1)
                              }
                            >
                              -
                            </Button>

                            <Input
                              type="number"
                              className="h-9 w-20 text-center"
                              min={0}
                              max={item.defectQty}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemQty(index, e.target.value)
                              }
                            />

                            <Button
                              variant="outline"
                              size="sm"
                              debounceTime={0}
                              className="h-9 w-9 rounded-full p-0"
                              disabled={item.quantity >= item.defectQty}
                              onClick={() =>
                                updateItemQty(index, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell className="p-3 font-semibold text-slate-900">
                          Rs.{item.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ))}

        <div className="h-20 shrink-0" />
      </div>

      <div className="sticky bottom-0 z-20 border-t bg-white/95 p-3 backdrop-blur sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedItemsCount > 0
              ? `${selectedItemsCount} item(s) selected with ${totalSelectedQuantity} total quantity`
              : 'Select invoice items to continue'}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsCreatingDebitNote(false)}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleCreateDebitNote}
            >
              {createDebitNoteMutation.isPending ? <Loading /> : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default DirectDebitNote;
