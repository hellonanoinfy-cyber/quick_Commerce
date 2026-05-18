export const queryKeys = {
  products: {
    all: ['products'],
    list: filters => ['products', 'list', filters],
    infinite: filters => ['products', 'infinite', filters],
    detail: slug => ['products', 'detail', slug],
    featured: count => ['products', 'featured', count],
    trending: count => ['products', 'trending', count],
    related: slug => ['products', 'related', slug],
    search: params => ['products', 'search', params],
  },
  categories: {
    all: ['categories'],
    tree: ['categories', 'tree'],
    featured: ['categories', 'featured'],
    detail: slug => ['categories', 'detail', slug],
  },
  brands: {
    all: ['brands'],
  },
  cart: {
    current: ['cart', 'current'],
  },
  wishlist: {
    current: ['wishlist', 'current'],
  },
  orders: {
    all: ['orders'],
    my: params => ['orders', 'my', params],
    detail: id => ['orders', 'detail', id],
  },
  reviews: {
    product: productId => ['reviews', 'product', productId],
  },
  users: {
    profile: ['users', 'profile'],
    addresses: ['users', 'addresses'],
  },
  admin: {
    dashboard: ['admin', 'dashboard'],
    products: params => ['admin', 'products', params],
    orders: params => ['admin', 'orders', params],
    customers: params => ['admin', 'customers', params],
    categories: params => ['admin', 'categories', params],
    inventory: params => ['admin', 'inventory', params],
    inventoryAlerts: ['admin', 'inventory', 'alerts'],
    reviews: params => ['admin', 'reviews', params],
    coupons: params => ['admin', 'coupons', params],
    banners: params => ['admin', 'banners', params],
  },
};
