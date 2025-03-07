import { render, screen, fireEvent } from '@testing-library/react';
import CartPage from '../app/dashboard/cart/page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

describe('CartPage', () => {
  it('renders cart items', () => {
    render(<CartPage />);
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Wireless Noise-Cancelling Headphones')).toBeInTheDocument();
  });

  it('updates quantity', () => {
    render(<CartPage />);
    const plusBtns = screen.getAllByText('+');
    fireEvent.click(plusBtns[0]);
    // qty for first item goes from 1 to 2
    const qtys = screen.getAllByText('2');
    expect(qtys.length).toBeGreaterThan(0);
  });

  it('removes item when qty reaches 0', () => {
    render(<CartPage />);
    const minusBtns = screen.getAllByText('−');
    fireEvent.click(minusBtns[0]); // qty 1 → 0 → removed
    expect(screen.queryByText('Wireless Noise-Cancelling Headphones')).not.toBeInTheDocument();
  });

  it('shows success screen after placing order', () => {
    render(<CartPage />);
    fireEvent.click(screen.getByText('Place order →'));
    expect(screen.getByText('Order placed!')).toBeInTheDocument();
  });
});
