import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFetchedDataColumns } from './fetchedDataColumns';

const FetchedDataModal = ({
  enterpriseId,
  open,
  onOpenChange,
  fetchedData,
  addIntoItemTypesMutation,
}) => {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedItemType, setSelectedItemTypes] = useState([]);

  const columns = useFetchedDataColumns();

  // Auto select all rows when modal opens
  useEffect(() => {
    if (open && fetchedData?.length) {
      const initialSelection = {};
      fetchedData.forEach((_, index) => {
        initialSelection[index] = true;
      });

      setRowSelection(initialSelection);
      setSelectedItemTypes(fetchedData);
    }
  }, [open, fetchedData]);

  // Sync selected items when user selects/deselects
  useEffect(() => {
    const selectedRows = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => fetchedData[Number(key)]);

    setSelectedItemTypes(selectedRows);
  }, [rowSelection, fetchedData]);

  const handleSubmit = () => {
    const formattedSelectedDatas = selectedItemType?.map((item) => ({
      goodsHsnMasterId: item.id,
      name: item.item,
      description: item.description,
    }));
    const payload = {
      enterpriseId,
      items: formattedSelectedDatas,
    };

    addIntoItemTypesMutation.mutate({
      data: payload,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirmed Fetched Items</DialogTitle>
          <DialogDescription>
            Select item types and confirm to update your business data.
          </DialogDescription>
        </DialogHeader>

        <div className="scrollBarStyles max-h-[500px] overflow-x-auto">
          <DataTable
            data={fetchedData ?? []}
            columns={columns}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </div>

        <span className="flex items-center gap-1 text-sm">
          <Check size={14} /> {selectedItemType?.length} selected items
        </span>

        <DialogFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            disabled={selectedItemType?.length === 0}
            onClick={handleSubmit}
          >
            Confirmed & Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FetchedDataModal;
