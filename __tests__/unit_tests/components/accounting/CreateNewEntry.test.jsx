import { render, screen, fireEvent } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import CreateNewEntry from '@/components/accounting/CreateNewEntry';
import { describe, it, expect, vi } from 'vitest';

// Mock the i18n routing
vi.mock('@/i18n/routing', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/dashboard/accounting/trial-balance/create-new-entry',
}));

describe('CreateNewEntry Component', () => {
  const mockOnCancel = vi.fn();

  it('renders correctly with default fields', () => {
    render(<CreateNewEntry onCancel={mockOnCancel} />);

    expect(screen.getByText('Create New Entry')).toBeInTheDocument();
    expect(screen.getByText(/Transaction Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Document ID/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Amount \(₹\)/i).length).toBeGreaterThanOrEqual(
      2,
    );
    expect(screen.getByText(/Notes/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Enter document ID/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Transaction notes/i),
    ).toBeInTheDocument();
  });

  it('renders with two default rows (Debit and Credit)', () => {
    render(<CreateNewEntry onCancel={mockOnCancel} />);

    const debitTags = screen.getAllByText('Debit');
    const creditTags = screen.getAllByText('Credit');

    // One in the table, one in the "Debit Row" button
    expect(debitTags.length).toBeGreaterThanOrEqual(1);
    expect(creditTags.length).toBeGreaterThanOrEqual(1);

    // Check for row inputs
    const amountInputs = screen.getAllByPlaceholderText('0');
    // 1 for header Amount, 2 for rows
    expect(amountInputs.length).toBeGreaterThanOrEqual(3);
  });

  it('adds a new Debit row when "Debit Row" button is clicked', () => {
    render(<CreateNewEntry onCancel={mockOnCancel} />);

    const initialDebitRows = screen
      .getAllByText('Debit')
      .filter((el) => el.tagName === 'SPAN');
    const addButton = screen.getByRole('button', { name: /Debit Row/i });

    fireEvent.click(addButton);

    const finalDebitRows = screen
      .getAllByText('Debit')
      .filter((el) => el.tagName === 'SPAN');
    expect(finalDebitRows.length).toBe(initialDebitRows.length + 1);
  });

  it('adds a new Credit row when "Credit Row" button is clicked', () => {
    render(<CreateNewEntry onCancel={mockOnCancel} />);

    const initialCreditRows = screen
      .getAllByText('Credit')
      .filter((el) => el.tagName === 'SPAN');
    const addButton = screen.getByRole('button', { name: /Credit Row/i });

    fireEvent.click(addButton);

    const finalCreditRows = screen
      .getAllByText('Credit')
      .filter((el) => el.tagName === 'SPAN');
    expect(finalCreditRows.length).toBe(initialCreditRows.length + 1);
  });

  it('removes a row when the delete button is clicked', () => {
    render(<CreateNewEntry onCancel={mockOnCancel} />);

    const initialRows = screen.getAllByRole('row');
    const deleteButtons = screen.getAllByRole('button', {
      name: /delete row/i,
    });

    fireEvent.click(deleteButtons[0]);

    const finalRows = screen.getAllByRole('row');
    expect(finalRows.length).toBe(initialRows.length - 1);
  });

  it('updates totals when row amounts are changed', async () => {
    render(<CreateNewEntry onCancel={mockOnCancel} />);

    // Find row amount inputs (excluding the main amount input)
    // The main amount input is first, followed by row inputs
    const allAmountInputs = screen.getAllByPlaceholderText('0');
    const debitAmountInput = allAmountInputs[1]; // First row is Debit by default
    const creditAmountInput = allAmountInputs[2]; // Second row is Credit by default

    await userEvent.type(debitAmountInput, '1000');
    await userEvent.type(creditAmountInput, '1000');

    expect(screen.getByText(/Dr ₹1,000 \/ Cr ₹1,000/i)).toBeInTheDocument();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    render(<CreateNewEntry onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
