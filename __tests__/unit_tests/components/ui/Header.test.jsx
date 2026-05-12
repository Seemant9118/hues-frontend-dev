import { render, screen } from '@/tests/test-utils';
import Header from '@/components/ui/Header';
import { useRouter } from 'next/navigation';

// Mocking the useRouter hook - although setup.js does this, 
// we override here specifically for this test's needs if required.
// In this case, we use the standard mock from setup.js 
// but we might need to check if push was called.
const pushMock = vi.fn();

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

describe('Header', () => {
  beforeEach(() => {
    // We clear mocks to ensure tests are isolated
    vi.clearAllMocks();
    render(<Header />);
  });

  it('should render the logo', () => {
    const image = screen.getByAltText('Logo');
    expect(image).toBeInTheDocument();
  });

  it('link should navigate to dashboard', () => {
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('should render the user profile button', () => {
    // Select specifically by class since it has no accessible name
    const { container } = render(<Header />);
    const button = container.querySelector('.your-profile');
    expect(button).toBeInTheDocument();
  });
});
