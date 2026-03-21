import { render, screen } from '@testing-library/react';

// Simple test to verify Jest setup works
describe('Jest Setup', () => {
  it('should render basic component', () => {
    const TestComponent = () => <div data-testid="test">Hello World</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('test')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle async operations', async () => {
    const TestComponent = () => <div data-testid="async-test">Loading</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('async-test')).toHaveTextContent('Loading');
  });

  it('should mock localStorage', () => {
    const mockSetItem = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: mockSetItem,
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });

    mockSetItem('test', 'value');
    expect(mockSetItem).toHaveBeenCalledWith('test', 'value');
  });
});
