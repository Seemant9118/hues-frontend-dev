import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowBigLeftDashIcon,
  ArrowBigRightDashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DataTablePagination({ table, filterData, setFilterData }) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${filterData?.limit}`}
            onValueChange={(value) => {
              setFilterData({ ...filterData, limit: Number(value) });
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={filterData?.limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex} of{' '}
          {table.getState().pagination.pageSize}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              setFilterData({ ...filterData, page: 1 });
              table.setPageIndex(0);
            }}
            disabled={filterData?.page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ArrowBigLeftDashIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setFilterData({ ...filterData, page: filterData.page - 1 });
              table.previousPage();
            }}
            disabled={filterData?.page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              setFilterData({ ...filterData, page: filterData.page + 1 });
              table.nextPage();
            }}
            disabled={
              table.getState().pagination.pageIndex ===
              table.getState().pagination.pageSize
            }
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              setFilterData({
                ...filterData,
                page: table.getState().pagination.pageSize,
              });
              table.setPageIndex(table.getState().pagination.pageSize);
            }}
            disabled={
              table.getState().pagination.pageIndex ===
              table.getState().pagination.pageSize
            }
          >
            <span className="sr-only">Go to last page</span>
            <ArrowBigRightDashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
