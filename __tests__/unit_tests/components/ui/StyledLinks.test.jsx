import { render, screen } from '@/tests/test-utils';
import { usePathname } from '@/i18n/routing';
import StyledLinks from '@/components/ui/StyledLinks';

// Mock the usePathname hook from @/i18n/routing
vi.mock('@/i18n/routing', async () => {
  const actual = await vi.importActual('@/i18n/routing');
  return {
    ...actual,
    usePathname: vi.fn(),
    Link: ({ children, href, className }) => (
      <a href={href} className={className}>
        {children}
      </a>
    ),
  };
});

const mockUsePathname = usePathname;

const link = {
  path: '/home',
  name: 'Home',
  icon: <svg data-testid="home-icon" />,
  subTab: [
    { path: '/home/sub1', name: 'Sub1', icon: <svg data-testid="sub1-icon" /> },
    { path: '/home/sub2', name: 'Sub2', icon: <svg data-testid="sub2-icon" /> },
  ],
};

describe('StyledLinks Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main link with correct styles when active', () => {
    mockUsePathname.mockReturnValue('/home');
    render(<StyledLinks link={link} />);
    
    // The classes are on the Link (mocked as <a>), not the text span
    const anchor = screen.getByText('Home').closest('a');
    expect(anchor).toHaveClass('bg-[#288AF91A]');
    expect(anchor).toHaveClass('text-[#288AF9]');
  });

  it('renders main link with correct styles when inactive', () => {
    mockUsePathname.mockReturnValue('/other');
    render(<StyledLinks link={link} />);
    
    const anchor = screen.getByText('Home').closest('a');
    expect(anchor).toHaveClass('bg-transparent');
    expect(anchor).toHaveClass('text-gray-600');
  });

  it('renders sub tabs when main link is active', () => {
    mockUsePathname.mockReturnValue('/home');
    render(<StyledLinks link={link} />);
    const subTab1 = screen.getByText('Sub1');
    const subTab2 = screen.getByText('Sub2');

    expect(subTab1).toBeInTheDocument();
    expect(subTab2).toBeInTheDocument();
  });

  it('renders sub tabs with correct styles when active/inactive', () => {
    mockUsePathname.mockReturnValue('/home/sub1');
    render(<StyledLinks link={link} />);
    
    const subTab1Anchor = screen.getByText('Sub1').closest('a');
    const subTab2Anchor = screen.getByText('Sub2').closest('a');

    expect(subTab1Anchor).toHaveClass('bg-[#288AF91A]');
    expect(subTab1Anchor).toHaveClass('text-[#288AF9]');
    expect(subTab2Anchor).toHaveClass('bg-transparent');
    expect(subTab2Anchor).toHaveClass('text-gray-600');
  });

  it('does not render sub tabs when main link is inactive', () => {
    mockUsePathname.mockReturnValue('/other');
    render(<StyledLinks link={link} />);
    const subTab1 = screen.queryByText('Sub1');
    const subTab2 = screen.queryByText('Sub2');

    expect(subTab1).not.toBeInTheDocument();
    expect(subTab2).not.toBeInTheDocument();
  });

  it('renders the correct icons for main link and sub tabs', () => {
    mockUsePathname.mockReturnValue('/home');
    render(<StyledLinks link={link} />);
    const mainIcon = screen.getByTestId('home-icon');
    const subIcon1 = screen.getByTestId('sub1-icon');
    const subIcon2 = screen.getByTestId('sub2-icon');

    expect(mainIcon).toBeInTheDocument();
    expect(subIcon1).toBeInTheDocument();
    expect(subIcon2).toBeInTheDocument();
  });
});
