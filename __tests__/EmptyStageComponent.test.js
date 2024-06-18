import { render, screen } from '@testing-library/react';
import { Orbit } from 'lucide-react';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';

describe('EmptyStageComponent', () => {
  const heading = 'Test Heading';
  const subItems = [
    { id: 1, subItemtitle: 'SubItem 1', item: 'Item 1' },
    {
      id: 2,
      subItemtitle: 'SubItem 2',
      item: 'Item 2',
      icon: <Orbit size={10} />,
    },
  ];

  beforeEach(() => {
    render(<EmptyStageComponent heading={heading} subItems={subItems} />);
  });

  test('renders heading correctly', () => {
    const headingElement = screen.getByText(heading);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders subItems correctly', () => {
    subItems.forEach((subItem) => {
      const subItemElement = screen.getByText(subItem.subItemtitle);
      expect(subItemElement).toBeInTheDocument();
      const itemElement = screen.getByText(subItem.item);
      expect(itemElement).toBeInTheDocument();
    });
  });

  test('renders provided icon correctly', () => {
    const subItemWithIcon = subItems.find((subItem) => subItem.icon);
    const iconElement = screen.getByTestId(`icon-${subItemWithIcon.id}`);
    expect(iconElement).toBeInTheDocument();
  });
});
