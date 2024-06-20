import { render, screen } from '@testing-library/react';
import Header from '@/components/ui/Header';
import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';

// Mocking the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const pushMock = jest.fn();
useRouter.mockReturnValue({
  push: pushMock,
});

// Suppress the specific fetchPriority warning
const originalError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
    // console.log('this is msg----->', typeof message, message);
    if (
      typeof message === 'string' &&
      message.includes(
        'React does not recognize the `%s` prop on a DOM element',
      )
    ) {
      return;
    }
    originalError(message, ...args);
  });
});

afterAll(() => {
  console.error.mockRestore();
});

describe('Header', () => {
  beforeEach(() => render(<Header />));
  it('should render the logo', () => {
    const image = screen.getByAltText('Logo');
    expect(image).toBeInTheDocument();
  });
  it('link should navigate to home page', () => {
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
  it('should render the user profile button', () => {
    const button = screen.getByRole('button');
    expect(button).toHaveClass('your-profile');
  });
});
