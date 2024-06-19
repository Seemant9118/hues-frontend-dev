import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashCard from '@/components/ui/DashCard.jsx';

describe('DashCard', () => {
  const title = 'Title';
  const numbers = '500';
  const growth = '+10';
  const icon = <>Icon</>;

  beforeEach(() => {
    render(
      <DashCard title={title} numbers={numbers} growth={growth} icon={icon} />,
    );
  });

  test('renders title correctly', () => {
    const dashCardElement = screen.getByText(title).parentElement.parentElement;
    expect(dashCardElement).toHaveTextContent(title);
  });

  test('renders numbers correctly', () => {
    const dashCardElement = screen.getByText(numbers);
    expect(dashCardElement).toBeInTheDocument();
  });

  test('renders growth correctly when growth is positive', () => {
    const growthElement = screen.getByText(growth);
    expect(growthElement).toBeInTheDocument();
    expect(growthElement).toHaveClass(
      'rounded-full px-2 py-1 text-sm font-semibold',
    );
    expect(growthElement).toHaveClass('bg-[#E3F4E3] text-[#1EC57F]');
  });

  test('renders growth correctly when growth is negative', () => {
    render(
      <DashCard title={title} numbers={numbers} growth="-10" icon={icon} />,
    );
    const growthElement = screen.getByText('-10');
    expect(growthElement).toBeInTheDocument();
    expect(growthElement).toHaveClass(
      'rounded-full px-2 py-1 text-sm font-semibold',
    );
    expect(growthElement).toHaveClass('bg-[#F4E3E3] text-[#E85555]');
  });

  test('renders icon correctly', () => {
    const iconElement = screen.getByText('Icon');
    expect(iconElement).toBeInTheDocument();
  });

  test('renders link correctly', () => {
    const linkElement = screen.getByRole('link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/insights');
  });
});
