import { render, screen } from '@/tests/test-utils';
import Avatar from '@/components/ui/Avatar';
import { describe, it, expect } from 'vitest';

describe('Avatar Component', () => {
  it('renders initials correctly for a given name', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders default initials when no name is provided', () => {
    render(<Avatar />);
    expect(screen.getByText('PR')).toBeInTheDocument();
  });

  it('renders initials for single word name', () => {
    render(<Avatar name="Alice" />);
    // getInitialsNames("Alice") -> "A" + "" -> "A"
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('applies background color based on name', () => {
    const { container: container1 } = render(<Avatar name="John Doe" />);
    const { container: container2 } = render(<Avatar name="John Doe" />);
    
    const bgColor1 = container1.firstChild.className.match(/bg-\w+-\d+/)[0];
    const bgColor2 = container2.firstChild.className.match(/bg-\w+-\d+/)[0];
    
    // Should be deterministic
    expect(bgColor1).toBe(bgColor2);
  });

  it('has correct base styling classes', () => {
    const { container } = render(<Avatar name="Test" />);
    const div = container.firstChild;
    
    expect(div).toHaveClass('flex', 'h-12', 'w-12', 'items-center', 'justify-center', 'rounded-full');
  });
});
