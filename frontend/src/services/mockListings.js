// ── Prototype / Mock Listings for Demo & Instant Browsing ────────────────────
export const PROTOTYPE_LISTINGS = [
  {
    _id: 'proto-1',
    title: 'Casio FX-991EX ClassWiz Scientific Calculator',
    description:
      'Essential for engineering mathematics and physics. High-resolution LCD, spreadsheet function, solar + battery backup. Comes with the original hard slide-on cover. Fully working, clean condition.',
    price: 850,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-aarav',
      name: 'Aarav Sharma',
      Reg_No: 'RA2211003010245'
    },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    _id: 'proto-2',
    title: 'Thomas Calculus (14th Edition Metric Version)',
    description:
      'Standard textbook for First Year B.Tech Calculus and Differential Equations. No missing pages, minimal pencil annotations, includes quick formula sheet summary inside.',
    price: 450,
    category: 'Books',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-sneha',
      name: 'Sneha Patel',
      Reg_No: 'RA2211003020112'
    },
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    _id: 'proto-3',
    title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    description:
      'Industry-leading active noise cancellation. 30 hours battery life, multipoint Bluetooth connection, carry case and 3.5mm cable included. Fantastic for hostel study rooms and library sessions.',
    price: 12500,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-rohan',
      name: 'Rohan Verma',
      Reg_No: 'RA2111003010589'
    },
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
  },
  {
    _id: 'proto-4',
    title: 'Hero Sprint Urban Gear Cycle (21 Speed)',
    description:
      'Dual disc brakes, front suspension, Shimano 21 gears. Well maintained, oiled chain, smooth tires. Great for commuting between hostel, tech park, and food courts. Free lock included.',
    price: 3800,
    category: 'Sports',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-vikram',
      name: 'Vikram Aditya',
      Reg_No: 'RA2011003010722'
    },
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString()
  },
  {
    _id: 'proto-5',
    title: 'Ergonomic Breathable Mesh Study Chair',
    description:
      'High-back ergonomic chair with adjustable headrest, lumbar cushion, and tilt mechanism. Smooth rolling caster wheels. Super comfortable for long coding and studying nights. Pick up near Campus Gate 2.',
    price: 1900,
    category: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1580481077197-28df5e8c17ec?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-ananya',
      name: 'Ananya Gupta',
      Reg_No: 'RA2211003030430'
    },
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    _id: 'proto-6',
    title: 'SRM Laboratory Coat (White Unisex, Medium)',
    description:
      'Pure white 100% cotton lab coat required for Chemistry, Bio, and Biotech practicals. Freshly washed, crisp buttons, standard embroidered pocket. Fits heights 5ft 5in to 5ft 9in comfortably.',
    price: 250,
    category: 'Clothing',
    images: [
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-pooja',
      name: 'Pooja Reddy',
      Reg_No: 'RA2311003010891'
    },
    createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString()
  },
  {
    _id: 'proto-7',
    title: 'Mini Drafter & Engineering Drawing Board Set',
    description:
      'Omega precision mini drafter with scales, sheet clips, pencil compass, and 80x60cm wooden drafting board. Complete set for First Year Engineering Graphics. Zero defects.',
    price: 600,
    category: 'Stationery',
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-kunal',
      name: 'Kunal Deshmukh',
      Reg_No: 'RA2311003020045'
    },
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  },
  {
    _id: 'proto-8',
    title: 'Logitech MX Master 3S Wireless Bluetooth Mouse',
    description:
      'Quiet clicks, 8K DPI sensor that tracks on glass, MagSpeed hyperfast electromagnetic scroll wheel. Can pair with 3 devices seamlessly. USB-C rechargeable. Original charging cable included.',
    price: 4200,
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: {
      _id: 'seller-tanmay',
      name: 'Tanmay Saxena',
      Reg_No: 'RA2111003010190'
    },
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString()
  }
]
