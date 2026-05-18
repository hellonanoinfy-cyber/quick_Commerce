export const SORT_OPTIONS = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'trending' },
];

export const CATEGORY_DESCRIPTIONS = {
  baby: 'Diapers, wipes, bath & skincare — everything for daily baby care.',
  'baby-care': 'Diapers, wipes, bath & skincare — everything for daily baby care.',
  fashion: 'Comfortable, stylish clothing for infants, boys and girls.',
  toys: 'Fun, safe toys for learning, play and development.',
  school: 'Bags, stationery, books and essentials for school.',
  'mom-care': 'Feeding, maternity wear and wellness for moms.',
  mom: 'Feeding, maternity wear and wellness for moms.',
  pharmacy: 'Baby-safe medicines and health essentials.',
  food: 'Nutritious baby food, formula and snacks.',
  furniture: 'Cribs, chairs, storage and gear for home.',
};

export function formatCatalogTitle(category, subcategory, searchQuery) {
  if (searchQuery) return `Results for "${searchQuery}"`;
  if (subcategory) {
    return subcategory
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  if (category) {
    return category
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return 'All Products';
}

export function getCategoryDescription(category) {
  if (!category) return 'Browse our full range of baby and kids essentials.';
  return CATEGORY_DESCRIPTIONS[category] || 'Curated products with fast delivery.';
}
