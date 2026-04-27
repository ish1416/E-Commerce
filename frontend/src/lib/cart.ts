// Shared cart store using localStorage
// This is the single source of truth for cart across all pages

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  store: string;
  qty: number;
}

const KEY = 'shopsmart_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  // Dispatch event so other components can react
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product: Omit<CartItem, 'qty'>) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
}

export function removeFromCart(id: string) {
  saveCart(getCart().filter((i) => i.id !== id));
}

export function updateQty(id: string, delta: number) {
  const cart = getCart()
    .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
    .filter((i) => i.qty > 0);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount(): number {
  return getCart().reduce((s, i) => s + i.qty, 0);
}
