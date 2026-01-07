import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],

            // Actions
            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingIndex = items.findIndex(item => item.id === product.id);

                if (existingIndex >= 0) {
                    const newItems = [...items];
                    newItems[existingIndex].quantity += quantity;
                    set({ items: newItems });
                } else {
                    set({ items: [...items, { ...product, quantity }] });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter(item => item.id !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                const items = get().items.map(item =>
                    item.id === productId ? { ...item, quantity } : item
                );
                set({ items });
            },

            clearCart: () => set({ items: [] }),

            // Computed values
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'autohub-cart',
        }
    )
);

export default useCartStore;
