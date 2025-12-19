export function DataTablePagination({
  table,
  currFetchedPage,
  totalPages,
  // totalRows,
}) {
  return (
    <div className="flex items-center justify-between border-t px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        {/* <span>
          Loaded: <strong>{totalRows}</strong>
        </span> */}

        {totalPages && currFetchedPage && (
          <span>
            Page <strong>{currFetchedPage}</strong> of{' '}
            <strong>{totalPages}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
