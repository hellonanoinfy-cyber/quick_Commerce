/** Curated imagery for MummaXpress storefront — high quality Unsplash */

const U = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

/** Cute happy baby — local file + Unsplash fallback (verified 200) */
export const HERO_IMAGES = {
  baby: '/images/hero/hero-baby-happy.jpg',
  babyRemote: U('photo-1573662012516-5cb4399006e7', 1400),
  testimonial: U('photo-1555252333-9f8e92a24dfd', 900),
};

export const PRODUCT_IMAGE_BY_CATEGORY = {
  baby: U('photo-1584839404042-8bc21d240e91'),
  fashion: U('photo-1519238263530-7bdd3c86c272'),
  toys: U('photo-1558060370-d644479cb6bf'),
  school: U('photo-1503676260728-1c00da094a0b'),
  pharmacy: U('photo-1584308666744-24d5c474f2ae'),
  food: U('photo-1615485290382-441e4d049cb5'),
  furniture: U('photo-1515488042361-ee00e0ddd4e6'),
  'mom-care': U('photo-1555252333-9f8e92a24dfd'),
  'diapers-and-wipes': U('photo-1584839404042-8bc21d240e91'),
  'baby-skin-care': U('photo-1582452721681-c56a89a8280a'),
  'feeding-essentials': U('photo-1597178380795-38c56a1a7053'),
  'baby-clothing': U('photo-1560506840-ec148e82a604'),
  'baby-food': U('photo-1550461716-dbf266b2a8a7'),
  'bath-and-hygiene': U('photo-1582452721681-c56a89a8280a'),
  'kids-footwear': U('photo-1622290319146-7b63df48a635'),
  'school-supplies': U('photo-1726726192148-af52008ff663'),
  'maternity-care': U('photo-1457342813143-a1ae27448a82'),
};

export const DEFAULT_PRODUCT_IMAGE = U('photo-1584839404042-8bc21d240e91');

/** Verified Unsplash IDs for homepage “Shop by Baby's Needs” circles */
export const SHOP_BY_NEEDS_IMAGES = {
  diapering: U('photo-1573662012516-5cb4399006e7', 256),
  feeding: U('photo-1597178380795-38c56a1a7053', 256),
  bath: U('photo-1582452721681-c56a89a8280a', 256),
  clothing: U('photo-1560506840-ec148e82a604', 256),
  toys: U('photo-1504484656217-38f8ffc617f9', 256),
  gear: U('photo-1710593668545-ed8272289743', 256),
  health: U('photo-1584308666744-24d5c474f2ae', 256),
  gifts: U('photo-1544784179-ae1535e9f013', 256),
};

export function getProductImageFallback(categorySlug) {
  if (!categorySlug) return DEFAULT_PRODUCT_IMAGE;
  const key = String(categorySlug).toLowerCase();
  return PRODUCT_IMAGE_BY_CATEGORY[key] || DEFAULT_PRODUCT_IMAGE;
}
