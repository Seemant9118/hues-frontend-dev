/* eslint-disable testing-library/no-wait-for-multiple-assertions */

import { render, screen, fireEvent, waitFor } from '@/tests/test-utils';
import CreateCreditNote from '@/components/credtiNote/CreateCreditNote';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCreditNote } from '@/services/Credit_Note_Services/CreditNoteServices';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBuyerSellerColumns } from '@/app/[locale]/(dashboard)/dashboard/sales/sales-debitNotes/[debit_id]/useBuyerSellerMergedColumns';
import { MergerDataTable } from '@/components/table/merger-data-table';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/services/Credit_Note_Services/CreditNoteServices', () => ({
  createCreditNote: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock(
  '@/app/[locale]/(dashboard)/dashboard/sales/sales-debitNotes/[debit_id]/useBuyerSellerMergedColumns',
  () => ({
    useBuyerSellerColumns: vi.fn(),
  }),
);

// Mock complex child components
vi.mock('@/components/table/merger-data-table', () => ({
  MergerDataTable: vi.fn(({ data, onSelectionChange }) => (
    <div data-testid="merger-data-table">
      <button onClick={() => onSelectionChange([])}>Deselect All</button>
      {data.map((item) => (
        <div key={item.rowId} data-testid={`row-${item.rowId}`}>
          {item.rowId}
        </div>
      ))}
    </div>
  )),
}));

describe('CreateCreditNote Component', () => {
  const mockPush = vi.fn();
  const mockOnClose = vi.fn();
  const mockData = [
    {
      rowId: '1',
      debitNoteItemId: 101,
      _isFirstRow: true,
      sellerQty: 10,
      sellerAmount: 1000,
      sellerResponse: 'ACCEPTED',
    },
    {
      rowId: '2',
      debitNoteItemId: 101,
      _isFirstRow: false,
      sellerQty: 2,
      sellerAmount: 200,
      sellerResponse: 'REJECTED',
    },
    {
      rowId: '3',
      debitNoteItemId: 102,
      _isFirstRow: true,
      sellerQty: 5,
      sellerAmount: 500,
      sellerResponse: 'REPLACEMENT',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
    useBuyerSellerColumns.mockReturnValue([]);

    // Default mock implementation
    vi.mocked(MergerDataTable).mockImplementation(
      ({ data, onSelectionChange }) => (
        <div data-testid="merger-data-table">
          <button onClick={() => onSelectionChange([])}>Deselect All</button>
          {data.map((item) => (
            <div key={item.rowId} data-testid={`row-${item.rowId}`}>
              {item.rowId}
            </div>
          ))}
        </div>
      ),
    );
  });

  it('renders correctly with title', () => {
    render(
      <CreateCreditNote
        isCreatingCreditNote={true}
        data={mockData}
        id="debit-123"
        onClose={mockOnClose}
      />,
    );

    expect(
      screen.getByText(/Select Items to Create Credit note/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Confirm & Create Credit Note/i }),
    ).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <CreateCreditNote
        isCreatingCreditNote={true}
        data={mockData}
        id="debit-123"
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows validation error if no items are selected', async () => {
    render(
      <CreateCreditNote
        isCreatingCreditNote={true}
        data={mockData}
        id="debit-123"
        onClose={mockOnClose}
      />,
    );

    const deselectBtn = screen.getByText('Deselect All');
    fireEvent.click(deselectBtn);

    fireEvent.click(
      screen.getByRole('button', { name: /Confirm & Create Credit Note/i }),
    );

    expect(
      await screen.findByText(/Please select at least 1 item to proceed/i),
    ).toBeInTheDocument();
  });

  it('calculates totals and submits correctly for multiple responses', async () => {
    createCreditNote.mockResolvedValue({ data: { data: { id: 'cn-456' } } });

    render(
      <CreateCreditNote
        isCreatingCreditNote={true}
        data={mockData}
        id="debit-123"
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Confirm & Create Credit Note/i }),
    );

    await waitFor(() => {
      expect(createCreditNote).toHaveBeenCalled();
      const callArgs = vi.mocked(createCreditNote).mock.calls[0][0];
      expect(callArgs).toEqual({
        id: 'debit-123',
        data: {
          itemsIds: [101, 102],
          approvedAmount: 1000,
          approvedQuantity: 10,
          taxAmount: 0,
          rejectedQuantity: 2,
          replacementQuantity: 5,
        },
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Credit Note Created');
    expect(mockPush).toHaveBeenCalledWith(
      '/dashboard/sales/sales-creditNotes/cn-456',
    );
  });

  it('handles API errors gracefully', async () => {
    createCreditNote.mockRejectedValue({
      response: { data: { message: 'Server Error' } },
    });

    render(
      <CreateCreditNote
        isCreatingCreditNote={true}
        data={mockData}
        id="debit-123"
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Confirm & Create Credit Note/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server Error');
    });
  });
});
