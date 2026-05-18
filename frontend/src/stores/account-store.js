import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAccountStore = create(
  persist(
    (set, get) => ({
      profilePhotoUrl: '',
      addresses: [],
      savedProducts: [],
      wishlist: [],
      children: [],
      setProfilePhotoUrl: profilePhotoUrl => set({ profilePhotoUrl }),
      addAddress: address => {
        const id = crypto.randomUUID();
        const shouldDefault = get().addresses.length === 0 || address.isDefault;
        set(state => ({
          addresses: [
            ...state.addresses.map(item => ({
              ...item,
              isDefault: shouldDefault ? false : item.isDefault,
            })),
            { ...address, id, isDefault: shouldDefault },
          ],
        }));
      },
      updateAddress: (id, address) => {
        set(state => ({
          addresses: state.addresses.map(item =>
            item.id === id
              ? { ...item, ...address }
              : address.isDefault
                ? { ...item, isDefault: false }
                : item
          ),
        }));
      },
      deleteAddress: id => {
        set(state => {
          const next = state.addresses.filter(item => item.id !== id);
          if (next.length > 0 && !next.some(item => item.isDefault)) {
            next[0] = { ...next[0], isDefault: true };
          }
          return { addresses: next };
        });
      },
      setDefaultAddress: id => {
        set(state => ({
          addresses: state.addresses.map(item => ({ ...item, isDefault: item.id === id })),
        }));
      },
      addWishlistItem: product => {
        set(state => {
          if (state.wishlist.some(item => item.id === product.id)) return state;
          return { wishlist: [product, ...state.wishlist] };
        });
      },
      removeWishlistItem: id => {
        set(state => ({ wishlist: state.wishlist.filter(item => item.id !== id) }));
      },
      addSavedProduct: product => {
        set(state => {
          if (state.savedProducts.some(item => item.id === product.id)) return state;
          return { savedProducts: [product, ...state.savedProducts] };
        });
      },
      addChild: child => {
        const id = crypto.randomUUID();
        set(state => ({
          children: [...state.children, { ...child, id }],
        }));
      },
      updateChild: (id, child) => {
        set(state => ({
          children: state.children.map(c => (c.id === id ? { ...c, ...child } : c)),
        }));
      },
      removeChild: id => {
        set(state => ({
          children: state.children.filter(c => c.id !== id),
        }));
      },
    }),
    {
      name: 'firstcry-account-storage',
    }
  )
);

export default useAccountStore;
