import { render, screen, fireEvent } from '@testing-library/react';
import ProductsPage from '../app/dashboard/products/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

describe('ProductsPage', () => {
  it('renders product grid', () => {
    render(<ProductsPage />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search products…')).toBeInTheDocument();
  });

  it('filters products by search', () => {
    render(<ProductsPage />);
    const input = screen.getByPlaceholderText('Search products…');
    fireEvent.change(input, { target: { value: 'keyboard' } });
    expect(screen.getByText('Mechanical Keyboard TKL')).toBeInTheDocument();
    expect(screen.queryByText('Merino Wool Crewneck')).not.toBeInTheDocument();
  });

  it('filters by category', () => {
    render(<ProductsPage />);
    fireEvent.click(screen.getByText('Apparel'));
    expect(screen.getByText('Merino Wool Crewneck')).toBeInTheDocument();
    expect(screen.queryByText('Mechanical Keyboard TKL')).not.toBeInTheDocument();
  });

  it('shows cart count after adding item', () => {
    render(<ProductsPage />);
    const addBtns = screen.getAllByText('Add to cart');
    fireEvent.click(addBtns[0]);
    expect(screen.getByText(/Cart \(1\)/)).toBeInTheDocument();
  });

  it('shows empty state when no results', () => {
    render(<ProductsPage />);
    const input = screen.getByPlaceholderText('Search products…');
    fireEvent.change(input, { target: { value: 'xyznotexist' } });
    expect(screen.getByText("No products match your search.")).toBeInTheDocument();
  });
});
