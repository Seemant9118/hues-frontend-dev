import { render, screen } from '@/tests/test-utils';
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
    const titleElement = screen.getByText(title);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders numbers correctly', () => {
    const numbersElement = screen.getByText(numbers);
    expect(numbersElement).toBeInTheDocument();
  });

  test('renders growth correctly when growth is positive', () => {
    const growthElement = screen.getByText(growth);
    expect(growthElement).toBeInTheDocument();
  });

  test('renders growth correctly when growth is negative', () => {
    // Re-render with negative growth
    render(
      <DashCard title={title} numbers={numbers} growth="-10" icon={icon} />,
    );
    const growthElement = screen.getByText('-10');
    expect(growthElement).toBeInTheDocument();
  });

  test('renders icon correctly', () => {
    const iconElement = screen.getByText('Icon');
    expect(iconElement).toBeInTheDocument();
  });
});
