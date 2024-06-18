import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import StyledLinks from "@/components/ui/StyledLinks";

// Mock the usePathname hook from next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

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
  it('renders main link with correct styles when active', () => {
    mockUsePathname.mockReturnValue('/home');
    render(<StyledLinks link={link} />);
    const mainLink = screen.getByText('Home');

    expect(mainLink).toHaveClass('bg-[#288AF91A] text-[#288AF9]');
  });

  it('renders main link with correct styles when inactive', () => {
    mockUsePathname.mockReturnValue('/other');
    render(<StyledLinks link={link} />);
    const mainLink = screen.getByText('Home');

    expect(mainLink).toHaveClass('bg-transparent text-grey');
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
    const subTab1 = screen.getByText('Sub1');
    const subTab2 = screen.getByText('Sub2');

    expect(subTab1).toHaveClass('bg-[#288AF91A] text-[#288AF9]');
    expect(subTab2).toHaveClass('bg-transparent text-grey');

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
