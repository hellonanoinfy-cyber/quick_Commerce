import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import useAuthStore from './auth-store';
import useUIStore from './ui-store';

import cartApi from '@/lib/api/cartApi';
import { normalizeApiError } from '@/lib/api/error-handler';
import { isGuestUser } from '@/lib/utils/jwt';

// ===================================================
// CART STORE
// ===================================================

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      isSyncing: false,
      error: null,
      pendingOperations: new Set(),

      // Computed
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const deliveryCharge = subtotal >= 499 ? 0 : 49;
        return subtotal + deliveryCharge;
      },

      // Show toast helper
      showToast: (message, type = 'info') => {
        const uiStore = useUIStore.getState();
        if (uiStore.showToast) {
          uiStore.showToast(message, type);
        } else {
          console.log(`[${type.toUpperCase()}] ${message}`);
        }
      },

      // Retry helper with exponential backoff
      withRetry: async (fn, retries = MAX_RETRIES) => {
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            return await fn();
          } catch (error) {
            lastError = error;
            // Don't retry on validation/auth errors
            if (
              error?.response?.status === 400 ||
              error?.response?.status === 401 ||
              error?.response?.status === 422
            ) {
              throw error;
            }
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
            }
          }
        }
        throw lastError;
      },

      // Normalize error message
      getErrorMessage: (error, defaultMsg = 'Something went wrong') => {
        if (!error) return defaultMsg;
        // Try various error formats from backend
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          defaultMsg;
        // Handle array of messages
        if (Array.isArray(msg)) return msg.join(', ');
        return msg;
      },

      // Actions
      addItem: async (product, quantity = 1) => {
        const { isAuthenticated } = useAuthStore.getState();
        const items = get().items;
        const productId = typeof product === 'string' ? product : product.id || product.productId;
        if (!productId) {
          get().showToast('Invalid product', 'error');
          return;
        }

        const oldItems = [...items];

        // Optimistic update
        const existingIndex = items.findIndex(item => item.productId === productId);

        const newItems = [...items];
        if (existingIndex >= 0) {
          newItems[existingIndex].quantity += quantity;
        } else {
          newItems.push({
            productId,
            slug: product.slug || null,
            name: product.name || 'Product',
            brand: product.brandName || product.brand || null,
            price: product.discountPrice || product.price || 0,
            image: product.primaryImageUrl || product.image || null,
            categorySlug: product.categorySlug || product.category?.slug || null,
            quantity,
            variant: product.variant || null,
          });
        }

        set({ items: newItems, isSyncing: true });

        if (isAuthenticated) {
          try {
            const response = await get().withRetry(
              () => cartApi.addItem(productId, quantity),
              MAX_RETRIES
            );
            // Sync with server response
            if (response && response.items) {
              set({ items: mapServerItems(response.items), isSyncing: false });
              const addedName = product.name || 'Item';
              get().showToast(`${addedName} added to cart`, 'success');
            } else {
              set({ isSyncing: false });
            }
          } catch (error) {
            console.error('Failed to sync cart item addition:', error);
            // Rollback optimistic update
            set({ items: oldItems, isSyncing: false });
            const errorMsg = get().getErrorMessage(error, 'Failed to add item to cart');
            get().showToast(errorMsg, 'error');
          }
        } else {
          set({ isSyncing: false });
          const addedName = product.name || 'Item';
          get().showToast(`${addedName} added to cart`, 'success');
        }
      },

      removeItem: async productId => {
        if (!productId) return;

        const { isAuthenticated } = useAuthStore.getState();
        const oldItems = get().items;

        // Find item name for toast
        const removedItem = oldItems.find(item => item.productId === productId);
        const removedName = removedItem?.name || 'Item';

        // Optimistic update
        set({
          items: oldItems.filter(item => item.productId !== productId),
          isSyncing: true,
        });

        if (isAuthenticated) {
          try {
            const response = await get().withRetry(
              () => cartApi.removeItem(productId),
              MAX_RETRIES
            );
            if (response && response.items) {
              set({ items: mapServerItems(response.items), isSyncing: false });
            } else {
              set({ isSyncing: false });
            }
          } catch (error) {
            console.error('Failed to remove cart item:', error);
            // Rollback
            set({ items: oldItems, isSyncing: false });
            const errorMsg = get().getErrorMessage(error, 'Failed to remove item');
            get().showToast(errorMsg, 'error');
          }
        } else {
          set({ isSyncing: false });
          get().showToast(`${removedName} removed from cart`, 'info');
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (!productId) return;

        if (quantity <= 0) {
          return get().removeItem(productId);
        }

        const { isAuthenticated } = useAuthStore.getState();
        const oldItems = get().items;

        // Optimistic update
        const updatedItems = oldItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );
        set({ items: updatedItems, isSyncing: true });

        if (isAuthenticated) {
          try {
            const response = await get().withRetry(
              () => cartApi.updateQuantity(productId, quantity),
              MAX_RETRIES
            );
            if (response && response.items) {
              set({ items: mapServerItems(response.items), isSyncing: false });
            } else {
              set({ isSyncing: false });
            }
          } catch (error) {
            console.error('Failed to update cart quantity:', error);
            // Rollback
            set({ items: oldItems, isSyncing: false });
            const errorMsg = get().getErrorMessage(error, 'Failed to update quantity');
            get().showToast(errorMsg, 'error');
          }
        } else {
          set({ isSyncing: false });
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        const oldItems = get().items;
        set({ items: [], isSyncing: true });

        if (isAuthenticated) {
          try {
            await get().withRetry(() => cartApi.clearCart(), MAX_RETRIES);
            set({ isSyncing: false });
            get().showToast('Cart cleared', 'info');
          } catch (error) {
            console.error('Failed to clear cart:', error);
            // Rollback
            set({ items: oldItems, isSyncing: false });
            const errorMsg = get().getErrorMessage(error, 'Failed to clear cart');
            get().showToast(errorMsg, 'error');
          }
        } else {
          set({ isSyncing: false });
          get().showToast('Cart cleared', 'info');
        }
      },

      fetchCart: async () => {
        const { isAuthenticated, token } = useAuthStore.getState();
        if (!isAuthenticated || isGuestUser(token)) {
          // Skip fetching cart for guests or unauthenticated users
          set({ items: [], isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await get().withRetry(() => cartApi.getCart(), MAX_RETRIES);
          if (response && response.items) {
            set({ items: mapServerItems(response.items), isLoading: false, error: null });
          } else {
            // Fallback to empty cart if API returns strange structure
            set({ items: [], isLoading: false });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', get().getErrorMessage(error));
          // Fall back to empty cart so UI doesn't crash on 500
          set({
            items: [],
            isLoading: false,
            error: get().getErrorMessage(error),
          });
        }
      },

      mergeGuestCart: async () => {
        const { isAuthenticated, user } = useAuthStore.getState();
        if (!isAuthenticated) return;

        const guestItems = get().items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        if (guestItems.length === 0) {
          await get().fetchCart();
          return;
        }

        set({ isSyncing: true });
        try {
          const response = await get().withRetry(
            () => cartApi.mergeCart(guestItems, user?.id),
            MAX_RETRIES
          );
          if (response && response.items) {
            set({ items: mapServerItems(response.items), isSyncing: false });
            get().showToast('Cart synced successfully', 'success');
          } else {
            await get().fetchCart();
            set({ isSyncing: false });
          }
        } catch (error) {
          console.error('Failed to merge cart:', error);
          await get().fetchCart();
          set({ isSyncing: false });
          get().showToast('Failed to sync cart, loaded server cart', 'warning');
        }
      },

      // Check if cart has items
      hasItems: () => get().items.length > 0,

      // Get item by productId
      getItem: productId => get().items.find(item => item.productId === productId),

      setLoading: isLoading => {
        set({ isLoading });
      },

      setError: error => {
        set({ error });
      },
    }),
    {
      name: 'firstcry-cart-storage',
      partialize: state => ({
        items: state.items,
      }),
    }
  )
);

// Helper to map backend entity to frontend store structure
const mapServerItems = serverItems => {
  if (!serverItems || !Array.isArray(serverItems)) return [];
  return serverItems.map(item => ({
    productId: item.productId || item.product?.id,
    slug: item.product?.slug || item.slug || null,
    name: item.product?.name || item.name || 'Product',
    brand: item.product?.brandName || item.product?.brand?.name || item.brand || null,
    price: item.product?.discountPrice || item.product?.price || item.price || 0,
    image:
      item.product?.primaryImageUrl ||
      item.product?.imageUrl ||
      item.product?.images?.find?.(image => image?.isPrimary)?.url ||
      item.product?.images?.[0]?.url ||
      item.image ||
      '/images/product-placeholder.svg',
    quantity: item.quantity || 1,
    variant: item.variant || null,
  }));
};

export default useCartStore;
