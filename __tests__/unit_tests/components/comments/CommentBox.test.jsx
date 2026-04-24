import CommentBox from '@/components/comments/CommentBox';
import {
  createComments,
  getComments,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { render, screen, userEvent, waitFor } from '@/tests/test-utils';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock services
vi.mock('@/services/Debit_Note_Services/DebitNoteServices', () => ({
  getComments: vi.fn(),
  createComments: vi.fn(),
  updateComments: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Tooltips
vi.mock('../auth/Tooltips', () => ({
  default: ({ trigger }) => <div>{trigger}</div>,
}));

vi.mock('./Comment', () => ({
  default: ({ comment }) => (
    <div data-testid="comment-item">{comment.text}</div>
  ),
}));

describe('CommentBox Component', () => {
  const mockContextId = '123';
  const mockContext = 'DEBIT_NOTE';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    getComments.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<CommentBox contextId={mockContextId} context={mockContext} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders "no comments" state when comment list is empty', async () => {
    getComments.mockResolvedValue({ data: { data: [] } });
    render(<CommentBox contextId={mockContextId} context={mockContext} />);

    // Wait for loading to finish
    await waitFor(
      () => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const textarea = await screen.findByTestId('comment-textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('renders comments list correctly', async () => {
    getComments.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            text: 'Comment 1',
            enterprisename: 'Ent A',
            commentedat: new Date().toISOString(),
            attachments: [],
          },
        ],
      },
    });
    render(<CommentBox contextId={mockContextId} context={mockContext} />);

    // Wait for loading to finish
    await waitFor(
      () => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Open the collapsible
    const trigger = await screen.findByRole('button', {
      name: /toggle comments/i,
    });
    await userEvent.click(trigger);

    const commentText = await screen.findByText('Comment 1');
    expect(commentText).toBeInTheDocument();
  });

  it('submits a new comment successfully', async () => {
    const user = userEvent.setup();
    getComments.mockResolvedValue({ data: { data: [] } });
    createComments.mockResolvedValue({ data: { message: 'Success' } });

    render(<CommentBox contextId={mockContextId} context={mockContext} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const textarea = await screen.findByTestId('comment-textarea');
    await user.type(textarea, 'New Test Comment');

    const sendButton = screen.getByText(/btn_send/i);
    await user.click(sendButton);

    await waitFor(() => {
      expect(createComments).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith('toast_comment_success');
  });

  it('handles file attachment and removal', async () => {
    const user = userEvent.setup();
    getComments.mockResolvedValue({ data: { data: [] } });
    render(<CommentBox contextId={mockContextId} context={mockContext} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    await screen.findByTestId('comment-textarea');

    const input = screen.getByLabelText(/Attach file/i);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    await user.upload(input, file);

    expect(await screen.findByText(/hello\.png/i)).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /remove file/i });
    await user.click(removeButton);

    expect(screen.queryByText(/hello\.png/i)).not.toBeInTheDocument();
  });
});
