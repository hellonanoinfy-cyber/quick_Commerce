/**
 * Mega menu sections per main category. Link hrefs are built in CategoryNav via category-nav-utils.
 */

export const megaMenuData = {
  school: {
    panel: { maxWidth: 900, maxHeight: 380, columns: 4 },
    quickLinks: [{ label: 'School Bags', sub: 'school-bags' }],
    sections: [
      {
        title: 'Tiffins & Water Bottles',
        links: ['Lunchbox', 'Water Bottles'],
      },
      {
        title: 'Stationery',
        links: [
          'Writing Essentials',
          'Erasers & Sharpeners',
          'Art & Craft',
          'Pencil Box',
          'Geometry Box',
          'Notebooks & Journals',
          'Study Table Accessories',
          'Clipboards',
          'Computer Glasses',
          'Folder',
        ],
      },
      {
        title: 'Books',
        links: [
          'Story Books',
          'Educational Books',
          'Writing & Coloring Books',
          'Picture & Sound Books',
          'Activity books',
          'Board Books',
        ],
      },
      {
        title: 'Sports',
        links: [
          'Cricket',
          'Racket Sports',
          'Football',
          'Swimming',
          'Cycling & Skates',
          'Sportswear',
          'Others',
        ],
      },
      {
        title: 'School Shoes & Socks',
        links: ['School Shoes', 'Socks'],
      },
      {
        title: 'Top Picks',
        links: ['More'],
      },
    ],
  },

  fashion: {
    panel: {
      maxWidth: 920,
      maxHeight: 400,
      columns: 5,
    },
    sections: [
      {
        title: 'Accessories',
        links: [
          'Caps & Scarfs',
          'Handbag',
          'Socks',
          'Sunglasses',
          'Hair Accessories',
          'Watches & Bands',
          'Mittens & Booties',
          'Luggage & Backpacks',
          'Jewellery',
          'Swimming',
          'Kids Makeup',
          'Belts',
          'Raincoats & Umbrellas',
          'Bathrobe',
        ],
      },
      {
        title: 'Bottom Wear',
        links: ['Joggers', 'Leggings', 'Trousers', 'Jeans', 'Shorts', 'Skirts'],
      },
      {
        title: 'Ethnic Wear',
        links: [
          'Dhoti Sets',
          'Sharara Sets',
          'Lehenga Choli',
          'Kurta Set',
          'Kurta',
          'Kurti Set',
          'Suit Set',
          'Nehru Jacket',
          'Kurta & Kurti Sets',
          'Lehenga',
        ],
      },
      {
        title: 'Footwear',
        links: [
          'Casual Shoes',
          'Sandals & Slippers',
          'School Shoes',
          'Clogs',
          'Boots',
          'Ballerinas',
        ],
      },
      {
        title: 'Co-ords & Sets',
        links: ['Top & Bottom Set', 'Winter Co-ord Set'],
      },
      {
        title: 'Top Wear',
        links: ['T-Shirts', 'Shirts', 'Tops & Tanks', 'Full Sleeve T-Shirt'],
      },
      {
        title: 'Rompers & Babysuits',
        links: ['Rompers', 'Dungarees'],
      },
      {
        title: 'Winter Wear',
        links: [
          'Sweatshirt',
          'Jackets & Hoodies',
          'Sweaters & Cardigan',
          'Thermals',
          'Winter Everyday Wear',
          'Winter Joggers',
          'Socks',
        ],
      },
      {
        title: 'Inner Wear',
        links: ['Vests', 'Boys Underwear', 'Girls Underwear', 'Camisoles & Slips'],
      },
      {
        title: 'Occasion Wear',
        links: ['Party Wear', 'Festive Wear', 'Wedding Wear'],
      },
    ],
  },

  toys: {
    panel: { maxWidth: 900, maxHeight: 380, columns: 4 },
    quickLinks: [
      { label: 'Board Games & Activities', sub: 'board-games-and-activities' },
      { label: 'Dolls & Doll House', sub: 'dolls-and-doll-house' },
      { label: 'Pretend & Role Play', sub: 'pretend-and-role-play' },
      { label: 'Soft Toys', sub: 'soft-toys' },
      { label: 'Action Figures & Collectibles', sub: 'action-figures-and-collectibles' },
      { label: 'Ride Ons', sub: 'ride-ons' },
      { label: 'Tents & Slides', sub: 'tents-and-slides' },
      { label: 'Toy Guns & Swords', sub: 'toy-guns-and-swords' },
      { label: 'Musical Instruments', sub: 'musical-instruments' },
    ],
    sections: [
      {
        title: 'Games & Puzzles',
        links: ['Puzzles', 'Board Games', 'Card Games'],
      },
      {
        title: 'STEM & Learning',
        links: ['STEAM Toys', 'Learning Systems', 'Baby Learning Toys', 'Kids Puzzles'],
      },
      {
        title: 'Building & Construction',
        links: ['Blocks', 'Magnetic Tiles', 'Construction Sets'],
      },
      {
        title: 'Art, Craft & DIYs',
        links: ['Art & Craft Kits', 'Playdough', 'DIY Kits'],
      },
      {
        title: 'Cars & RC Toys',
        links: ['Cars & Trucks', 'RC Toys', 'Train Sets'],
      },
      {
        title: 'Baby Toys',
        links: [
          'Rattles & Teether',
          'Stacking & Sorting',
          'Musical Toys',
          'Activity & Learning',
          'Push & Pull Toys',
        ],
      },
      {
        title: 'Sports & Activities',
        links: [
          'Cricket',
          'Football & More',
          'Cycling & Skating',
          'Racket Sports',
          'Swimming',
          'Indoor Activities',
        ],
      },
      {
        title: 'Electronic & Interactive Toys',
        links: [
          'Robotic Toys',
          'Gadgets & Electronics',
          'Digital Camera',
          'Gamebox',
          'Talking Toys',
          'More',
        ],
      },
    ],
  },

  mom: {
    quickLinks: [
      { label: 'Beauty & Personal Care', sub: 'beauty-and-personal-care' },
      { label: 'Pharmacy', sub: 'pharmacy' },
    ],
    sections: [
      {
        title: 'Feeding Essentials',
        links: [
          'Nursing Bras',
          'Nursing Cover',
          'Feeding Pillow',
          'Pregnancy Pillow',
          'Breast pump',
        ],
      },
      {
        title: 'Postpartum Essentials',
        links: [
          'Sanitary Pads',
          'Disposable Panty',
          'Breast Pads',
          'Diaper Bags',
          'Nipple Shield & Pullers',
        ],
      },
      {
        title: 'Maternity Clothing',
        links: ['Co-ord Set', 'Top & Bottom Wear', 'Dresses', 'Innerwear', "Women's Ethnic"],
      },
      {
        title: 'Reading Corner',
        links: ['Books', 'More'],
      },
    ],
  },

  baby: {
    sections: [
      {
        title: 'Bath & Skin',
        links: ['Baby Wash', 'Shampoo', 'Lotion', 'Baby Oil', 'Talc & Powder', 'Wipes'],
      },
      {
        title: 'Diapering',
        links: ['Diapers', 'Diaper Rash Cream', 'Changing Mats', 'Wet Wipes'],
      },
      {
        title: 'Feeding',
        links: ['Baby Food', 'Cereal', 'Formula', 'Sippy Cups', 'Bibs', 'High Chairs'],
      },
      {
        title: 'Health & Safety',
        links: [
          'Thermometers',
          'Nasal Aspirators',
          'Baby Monitors',
          'Safety Gates',
          'Corner Guards',
        ],
      },
    ],
  },

  pharmacy: {
    sections: [
      {
        title: 'Medicines',
        links: [
          'Fever & Pain',
          'Cold & Cough',
          'Digestion',
          'Vitamins & Minerals',
          'Ear & Eye Drops',
        ],
      },
      {
        title: 'Baby Health',
        links: ['Gripe Water', 'Colic Drops', 'Teething Gels', 'Probiotic Drops'],
      },
      {
        title: 'First Aid',
        links: ['Bandages', 'Antiseptic Creams', 'Thermometers', 'Pulse Oximeters'],
      },
    ],
  },

  food: {
    sections: [
      {
        title: 'Stage 1 (0-6M)',
        links: ['Rice Cereal', 'Purees', 'Formula'],
      },
      {
        title: 'Stage 2 (6-12M)',
        links: ['Fruit Purees', 'Veggie Mash', 'Porridge Mixes'],
      },
      {
        title: 'Stage 3 (12M+)',
        links: ['Pasta', 'Khichdi Mixes', 'Soups', 'Snacks'],
      },
    ],
  },

  furniture: {
    sections: [
      {
        title: 'Beds & Cribs',
        links: ['Baby Cots', 'Toddler Beds', 'Bunk Beds', 'Bedside Cribs'],
      },
      {
        title: 'Storage',
        links: ['Toy Storage', 'Wardrobes', 'Bookshelves', 'Drawer Units'],
      },
      {
        title: 'Seating',
        links: ['High Chairs', 'Bean Bags', 'Kids Chairs', 'Feeding Chairs'],
      },
      {
        title: 'Study',
        links: ['Study Tables', 'Study Chairs', 'Bookshelves', 'Desks'],
      },
    ],
  },

  more: {
    sections: [
      {
        title: 'Shop More',
        links: ['Gift Cards', 'Clearance', 'New Arrivals', 'Best Sellers', 'Brands'],
      },
    ],
  },

  'summer-break': {
    panel: { maxWidth: 720, maxHeight: 320, columns: 3 },
    quickLinks: [
      { label: 'Summer Wear', sub: 'summer-wear' },
      { label: 'Swim & Beach', sub: 'swim-and-beach' },
    ],
    sections: [
      {
        title: 'Summer Essentials',
        links: ['Cotton T-Shirts', 'Shorts', 'Summer Dresses', 'Caps & Hats', 'Sunglasses'],
      },
      {
        title: 'Outdoor & Swim',
        links: ['Swimwear', 'Sandals', 'Flip Flops', 'Water Bottles', 'Sunscreen'],
      },
      {
        title: 'Stay Cool',
        links: ['Cotton Rompers', 'Sleeveless Tops', 'Lightweight Joggers', 'UV Protection'],
      },
    ],
  },
};

const DEFAULT_PANEL = {
  maxWidth: 880,
  maxHeight: 380,
  columns: 4,
};

/** Flat list for categories that only expose sections (no quickLinks wrapper) */
export function getMegaMenuSections(categoryKey) {
  const entry = megaMenuData[categoryKey];
  if (!entry) return null;
  if (Array.isArray(entry)) return entry;
  return entry.sections ?? null;
}

export function getMegaMenuQuickLinks(categoryKey) {
  const entry = megaMenuData[categoryKey];
  if (!entry || Array.isArray(entry)) return [];
  return entry.quickLinks ?? [];
}

export function getMegaMenuPanelConfig(categoryKey) {
  const entry = megaMenuData[categoryKey];
  if (!entry || Array.isArray(entry)) return DEFAULT_PANEL;
  return { ...DEFAULT_PANEL, ...(entry.panel ?? {}) };
}
