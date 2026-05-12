import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  render,
  screen,
  fireEvent,
  waitFor,
  userEvent,
} from '@/tests/test-utils';
import Comment from '@/components/comments/Comment';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { updateComments } from '@/services/Debit_Note_Services/DebitNoteServices';
import { toast } from 'sonner';

// Define mocks
vi.mock('@/services/Debit_Note_Services/DebitNoteServices', () => ({
  updateComments: vi.fn(),
  getComments: vi.fn(),
  createComments: vi.fn(),
}));

vi.mock('@/appUtils/helperFunctions', () => ({
  getEnterpriseId: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/Template_Services/Template_Services', () => ({
  viewPdfInNewTab: vi.fn(),
}));

vi.mock('../Modals/InvoicePDFViewModal', () => ({
  default: ({ cta }) => <div data-testid="invoice-pdf-modal">{cta}</div>,
}));

describe('Comment Component', () => {
  const mockComment = {
    id: 1,
    commentid: 1,
    text: 'Original Comment',
    enterprisename: 'Enterprise A',
    enterpriseid: 'ent-1',
    commentedat: new Date().toISOString(),
    updatedat: new Date().toISOString(),
    attachments: [
      {
        id: 'att-1',
        fileName: 'test.pdf',
        document: { url: 'http://example.com/test.pdf' },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders comment details correctly', () => {
    vi.mocked(getEnterpriseId).mockReturnValue('ent-2');
    render(<Comment comment={mockComment} invalidateId="inv-1" />);

    expect(screen.getByText('Enterprise A')).toBeInTheDocument();
    expect(screen.getByText('Original Comment')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('shows edit button when user is the author and within time limit', () => {
    vi.mocked(getEnterpriseId).mockReturnValue('ent-1');
    render(<Comment comment={mockComment} invalidateId="inv-1" />);

    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('hides edit button when user is not the author', () => {
    vi.mocked(getEnterpriseId).mockReturnValue('ent-2');
    render(<Comment comment={mockComment} invalidateId="inv-1" />);

    expect(screen.queryByText('edit')).not.toBeInTheDocument();
  });

  it('hides edit button when time limit (15 mins) has passed', () => {
    vi.mocked(getEnterpriseId).mockReturnValue('ent-1');
    const oldComment = {
      ...mockComment,
      commentedat: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    };
    render(<Comment comment={oldComment} invalidateId="inv-1" />);

    expect(screen.queryByText('edit')).not.toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', () => {
    vi.mocked(getEnterpriseId).mockReturnValue('ent-1');
    render(<Comment comment={mockComment} invalidateId="inv-1" />);

    fireEvent.click(screen.getByText('edit'));

    expect(screen.getByRole('textbox')).toHaveValue('Original Comment');
    expect(screen.getByText('save')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('updates comment successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(getEnterpriseId).mockReturnValue('ent-1');
    vi.mocked(updateComments).mockResolvedValue({
      data: { message: 'Success' },
    });

    render(<Comment comment={mockComment} invalidateId="inv-1" />);
    fireEvent.click(screen.getByText('edit'));

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Updated Comment');

    fireEvent.click(screen.getByText('save'));

    await waitFor(() => {
      expect(updateComments).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith('toast_update_success');
  });

  it('shows error toast when trying to save empty comment', () => {
    vi.mocked(getEnterpriseId).mockReturnValue('ent-1');
    render(<Comment comment={mockComment} invalidateId="inv-1" />);
    fireEvent.click(screen.getByText('edit'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '   ' } });

    fireEvent.click(screen.getByText('save'));

    expect(toast.error).toHaveBeenCalledWith('toast_empty_comment_error');
  });

  it('cancels editing and reverts changes', () => {
    vi.mocked(getEnterpriseId).mockReturnValue('ent-1');
    render(<Comment comment={mockComment} invalidateId="inv-1" />);
    fireEvent.click(screen.getByText('edit'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });

    fireEvent.click(screen.getByText('cancel'));

    expect(screen.getByText('Original Comment')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
