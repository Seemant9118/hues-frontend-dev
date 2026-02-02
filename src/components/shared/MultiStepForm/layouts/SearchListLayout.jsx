import { invoiceApi } from '@/api/invoice/invoiceApi';
import { formattedAmount, getEnterpriseId } from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import FilterInvoices from '@/components/invoices/FilterInvoices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePermission } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { getAllSalesInvoices } from '@/services/Invoice_Services/Invoice_Services';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';

const PAGE_LIMIT = 10;

export default function SearchListLayout({
  selectedValue,
  onSelect,
  renderItem,
  errors,
}) {
  const enterpriseId = getEnterpriseId();
  const { hasPermission } = usePermission();

  const [filterData, setFilterData] = useState({});

  // ✅ selection view (selected invoice only)
  const [isSelectionView, setIsSelectionView] = useState(false);

  // ✅ infinite scroll ref
  const loaderRef = useRef(null);

  // ✅ stable key (safe when filterData is null/undefined)
  const stableFilterKey = useMemo(() => {
    return JSON.stringify(filterData || {});
  }, [filterData]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading: isInvoiceLoading,
  } = useInfiniteQuery({
    queryKey: [
      invoiceApi.getAllSalesInvoices.endpointKey,
      enterpriseId,
      stableFilterKey,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const payload = {
        page: pageParam,
        limit: PAGE_LIMIT,
        ...(filterData || {}),
      };

      return getAllSalesInvoices({
        id: enterpriseId,
        data: payload,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage?.data?.data?.totalPages || 1;
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled: !!enterpriseId && hasPermission('permission:sales-view'),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // ✅ Flatten + Deduplicate invoices
  const invoiceListing = useMemo(() => {
    const flattened =
      data?.pages?.map((page) => page?.data?.data?.data || []).flat() || [];

    const unique = Array.from(
      new Map(
        flattened.map((sale) => [sale?.invoiceId || sale?.id, sale]),
      ).values(),
    );

    return unique;
  }, [data]);

  // ✅ Items format for UI
  const items = useMemo(() => {
    return invoiceListing.map((inv) => ({
      value: inv?.invoiceId || inv?.id,
      orderId: inv?.orderId,
      title: inv?.invoiceReferenceNumber || 'Invoice',
      subtitle: inv?.customerName || 'Customer_Name',
      amount: inv?.totalAmount ? formattedAmount(inv.totalAmount) : '',
      date: inv?.invoiceDate
        ? moment(inv.invoiceDate).format('DD/MM/YYYY')
        : '',
    }));
  }, [invoiceListing]);

  // ✅ selected invoice
  const selectedInvoice = useMemo(() => {
    return items.find((it) => it.value === selectedValue) || null;
  }, [items, selectedValue]);

  // ✅ infinite scroll (only list view)
  useEffect(() => {
    if (isSelectionView) return;
    if (!loaderRef.current) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(loaderRef.current);
    // eslint-disable-next-line consistent-return
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isSelectionView]);

  const handleSelectInvoice = (invoiceId, orderId) => {
    onSelect(invoiceId, orderId);
    setIsSelectionView(true);
  };

  const handleChangeInvoice = () => {
    setIsSelectionView(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {errors?.invoiceId && (
        <InfoBanner
          text={errors.invoiceId}
          showSupportLink={false}
          variant="danger"
        />
      )}
      {/* ✅ Selected invoice view */}
      {isSelectionView && selectedInvoice ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Selected Invoice</h2>

            <Button variant="outline" size="sm" onClick={handleChangeInvoice}>
              Change Invoice
            </Button>
          </div>

          <Card className="flex items-center gap-4 border-primary bg-primary/5 p-4 ring-2 ring-primary/20">
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {selectedInvoice.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.subtitle}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-gray-900">
                    {selectedInvoice.amount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedInvoice.date}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <>
          {/* ✅ Header */}
          <div className="flex items-center justify-between border-b p-2">
            <h2 className="font-medium">Search and filter</h2>

            <FilterInvoices
              isSalesFilter={true}
              setFilterData={(val) => setFilterData(val || {})} // ✅ safe always object
            />
          </div>

          {/* ✅ Loading */}
          {isInvoiceLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading invoices...
            </div>
          ) : (
            <>
              {items.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Showing {items.length} invoices
                </p>
              )}

              {/* Items List */}
              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No items found
                  </div>
                ) : (
                  items.map((item) => {
                    const isSelected = selectedValue === item.value;

                    if (renderItem) {
                      return renderItem(item, isSelected, () =>
                        handleSelectInvoice(item.value, item.orderId),
                      );
                    }

                    return (
                      <Card
                        key={item.value}
                        onClick={() =>
                          handleSelectInvoice(item.value, item.orderId)
                        }
                        className={cn(
                          'flex cursor-pointer items-center gap-4 p-4 transition-all hover:border-primary hover:bg-accent hover:shadow-md',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-gray-200 hover:border-gray-300',
                        )}
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {item.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.subtitle}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <span className="font-semibold text-gray-900">
                                {item.amount}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.date}
                              </span>
                            </div>
                          </div>

                          {item.badge && (
                            <div className="mt-1">
                              <Badge variant={item.badge.variant || 'default'}>
                                {item.badge.text}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Infinite Loader */}
              <div
                ref={loaderRef}
                className="py-6 text-center text-sm text-muted-foreground"
              >
                {isFetchingNextPage
                  ? 'Loading more invoices...'
                  : hasNextPage
                    ? 'Scroll to load more'
                    : items.length > 0
                      ? 'No more invoices'
                      : null}
              </div>

              {isFetching && !isFetchingNextPage && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Updating list...
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
