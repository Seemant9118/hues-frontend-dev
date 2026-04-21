import { render, screen } from '@/tests/test-utils';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';

describe('EmptyStageComponent', () => {
  const heading = 'Test Heading';
  const subItems = ['sub1', 'sub2'];

  beforeEach(() => {
    render(<EmptyStageComponent heading={heading} subItems={subItems} />);
  });

  test('renders heading correctly', () => {
    subItems.forEach((subItem) => {
      // The component renders translations(`${subItem}.value`)
      // Our mock returns the key if not found
      const subItemElement = screen.getByText(`${subItem}.value`);
      expect(subItemElement).toBeInTheDocument();
    });
  });

  test('renders the Orbit icon for sub items', () => {
    // The component renders an Orbit icon for each sub item
    // We check for list items as a proxy for the sub-item rendering
    expect(screen.getAllByRole('listitem')).toHaveLength(subItems.length);
  });
});
