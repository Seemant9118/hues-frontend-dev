import { Button, buttonVariants } from '@/components/ui/button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  beforeAll(() => {});
  test('renders button with correct text', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveTextContent('Click Me');
  });
  test('renders button with correct variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(
      buttonVariants({ variant: 'destructive' }),
    );
  });
  test('renders button with correct size', () => {
    render(<Button size="sm">Small</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass(buttonVariants({ size: 'sm' }));
  });
  test('renders button with correct class names', () => {
    render(<Button className="custom-class">Custom</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('custom-class');
  });
  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const buttonElement = screen.getByRole('button');
    await userEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  test('renders with default type button', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveAttribute('type', 'button');
  });
  test('renders with variable type', () => {
    render(<Button type="submit">Submit</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });
  test('renders as a child component', () => {
    const handleClick = jest.fn();
    render(
      <Button asChild className="xyz">
        <div>Child</div>
      </Button>,
    );
    const buttonElement = screen.getByText('Child');
    expect(buttonElement).toHaveClass('xyz');
  });

  test('renders with provided props', () => {
    render(
      <Button data-testid="button" aria-label="button" summary="xyz">
        Click Me
      </Button>,
    );
    const buttonElement = screen.getByTestId('button');
    expect(buttonElement).toHaveAttribute('aria-label', 'button');
    expect(buttonElement).toHaveAttribute('summary', 'xyz');
  });
});
