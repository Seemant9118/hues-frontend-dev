'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { APIinstance } from '@/services';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DebouncedInput from '@/components/ui/DebouncedSearchInput';
import moment from 'moment';
import { Search } from 'lucide-react';

export default function DocumentSearchModal({
  isOpen,
  onClose,
  documentTypeMap,
  documentType,
  onSelect,
}) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Fetch documents list with useQuery
  const {
    data: searchResults = [],
    isFetching: isFetchingDocs,
    error: fetchErrorObj,
  } = useQuery({
    queryKey: ['documentSearch', documentType, searchTerm],
    queryFn: async () => {
      if (searchTerm.trim().length < 3) return [];

      const enterpriseId = getEnterpriseId() || 150;
      const config = documentTypeMap[documentType];
      if (!config) return [];

      let response;
      if (config.method === 'POST') {
        const url = config.url(enterpriseId);
        response = await APIinstance.post(url, {
          searchString: searchTerm,
          page: 1,
          limit: 10,
        });
      } else {
        const baseUrl = config.url();
        const url = `${baseUrl}&searchString=${encodeURIComponent(searchTerm)}`;
        response = await APIinstance.get(url);
      }

      let dataList = [];
      const resData = response?.data?.data;
      if (resData) {
        if (Array.isArray(resData)) {
          dataList = resData;
        } else if (resData.data && Array.isArray(resData.data)) {
          dataList = resData.data;
        } else if (Array.isArray(response?.data)) {
          dataList = response?.data;
        }
      } else if (response?.data && Array.isArray(response.data)) {
        dataList = response.data;
      }
      return dataList;
    },
    enabled: isOpen && searchTerm.trim().length >= 3,
    refetchOnWindowFocus: false,
  });

  const fetchError =
    fetchErrorObj?.response?.data?.message || fetchErrorObj?.message || '';

  // Reset search term when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const getDisplayFields = (item) => {
    const id =
      item.referenceNumber ||
      item.invoiceReferenceNumber ||
      item.paymentReferenceNumber ||
      item.id ||
      '';
    const partner =
      item.clientName ||
      item.customerName ||
      item.vendorName ||
      item.enterpriseName ||
      '--';
    const amt = item.totalAmount || item.amount || item.amountPaid || 0;

    let dateVal =
      item.createdAt || item.invoiceDate || item.paymentDate || item.date || '';
    if (dateVal) {
      dateVal = moment(dateVal).isValid()
        ? moment(dateVal).format('DD/MM/YYYY')
        : dateVal;
    } else {
      dateVal = '--';
    }

    return { id, partner, amt, dateVal };
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Search {documentTypeMap[documentType]?.title || 'Documents'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <DebouncedInput
            placeholder="Search by ID, partner name, reference number..."
            onDebouncedChange={(val) => setSearchTerm(val)}
            className="w-full"
          />

          <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
            {searchTerm.trim().length < 3 ? (
              <div className="flex flex-col items-center justify-center gap-1 py-8 text-center text-sm text-gray-500">
                <Search className="mb-1 h-8 w-8 text-gray-300" />
                <span className="font-medium">
                  Type at least 3 characters to search
                </span>
                <span className="text-xs text-gray-400">
                  {searchTerm.trim().length === 0
                    ? 'Enter keywords to search database'
                    : `Typed ${searchTerm.trim().length} of 3 required characters`}
                </span>
              </div>
            ) : isFetchingDocs ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : fetchError ? (
              <div className="py-8 text-center text-sm text-red-500">
                {fetchError}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No documents found.
              </div>
            ) : (
              searchResults.map((item, idx) => {
                const { id, partner, amt, dateVal } = getDisplayFields(item);
                return (
                  <div
                    key={item.id || item.paymentId || idx}
                    onClick={() => {
                      onSelect(id, amt);
                      onClose();
                    }}
                    className="flex cursor-pointer flex-col gap-1 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {id || 'No ID'}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{Number(amt || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{partner}</span>
                      <span>{dateVal}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
