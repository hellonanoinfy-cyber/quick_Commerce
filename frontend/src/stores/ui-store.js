import { create } from 'zustand';

// ===================================================
// UI STORE
// ===================================================

const useUIStore = create((set, get) => ({
  // State
  sidebarOpen: false,
  modalOpen: null,
  toast: null,
  theme: 'light',
  isMobileMenuOpen: false,
  isCartOpen: false,
  activeModalData: null,

  // Cart Drawer
  toggleCart: () => {
    set({ isCartOpen: !get().isCartOpen });
  },

  setCartOpen: open => {
    set({ isCartOpen: open });
  },

  // Sidebar
  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen });
  },

  setSidebarOpen: open => {
    set({ sidebarOpen: open });
  },

  // Mobile Menu
  toggleMobileMenu: () => {
    set({ isMobileMenuOpen: !get().isMobileMenuOpen });
  },

  setMobileMenuOpen: open => {
    set({ isMobileMenuOpen: open });
  },

  // Modal
  openModal: (modalName, data = null) => {
    set({ modalOpen: modalName, activeModalData: data });
  },

  closeModal: () => {
    set({ modalOpen: null, activeModalData: null });
  },

  // Toast Notifications
  showToast: (message, type = 'info', duration = 5000) => {
    set({ toast: { message, type, duration } });

    if (duration > 0) {
      setTimeout(() => {
        get().hideToast();
      }, duration);
    }
  },

  hideToast: () => {
    set({ toast: null });
  },

  // Theme
  setTheme: theme => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('firstcry-theme', theme);
    }
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // Loading states
  isPageLoading: false,
  setPageLoading: loading => {
    set({ isPageLoading: loading });
  },

  // Search
  searchQuery: '',
  setSearchQuery: query => {
    set({ searchQuery: query });
  },

  // Breadcrumbs
  breadcrumbs: [],
  setBreadcrumbs: crumbs => {
    set({ breadcrumbs: crumbs });
  },

  // Active section
  activeSection: 'home',
  setActiveSection: section => {
    set({ activeSection: section });
  },
}));

export default useUIStore;
