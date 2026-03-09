// src/everyone-pages/products/data/productsData.js

export const allProducts = [
  // CONSOLES
  {
    id: 1,
    name: 'PlayStation 5 Console',
    category: 'console',
    subcategory: 'playstation',
    price: 84999,
    priceKES: 'KSh 84,999',
    rating: 4.8,
    reviews: 128,
    inStock: true,
    storeOnly: true,
    description: 'Next-gen gaming with lightning-fast SSD and ray tracing',
    features: ['4K Gaming', 'Ray Tracing', 'Ultra-fast SSD', 'DualSense Controller'],
    brand: 'Sony',
    imageUrl: 'https://picsum.photos/seed/ps5/400/300',
    tags: ['Best Seller', '4K', 'Next-Gen']
  },
  {
    id: 2,
    name: 'Xbox Series X',
    category: 'console',
    subcategory: 'xbox',
    price: 79999,
    priceKES: 'KSh 79,999',
    rating: 4.7,
    reviews: 95,
    inStock: true,
    storeOnly: false,
    description: 'Most powerful Xbox with 4K gaming at 120 FPS',
    features: ['4K at 120FPS', 'Quick Resume', 'Game Pass', 'Backward Compatible'],
    brand: 'Microsoft',
    imageUrl: 'https://picsum.photos/seed/xbox/400/300',
    tags: ['4K', 'Game Pass', 'Powerful']
  },
  {
    id: 3,
    name: 'Nintendo Switch OLED',
    category: 'console',
    subcategory: 'nintendo',
    price: 45999,
    priceKES: 'KSh 45,999',
    rating: 4.6,
    reviews: 210,
    inStock: true,
    storeOnly: true,
    description: 'Vibrant OLED screen for handheld and TV gaming',
    features: ['7-inch OLED', 'Enhanced Audio', '64GB Storage', 'Tabletop Mode'],
    brand: 'Nintendo',
    imageUrl: 'https://picsum.photos/seed/switch/400/300',
    tags: ['Portable', 'Family', 'OLED']
  },

  // HEADSETS
  {
    id: 4,
    name: 'Razer BlackShark V2 Pro',
    category: 'headset',
    subcategory: 'wireless',
    price: 15999,
    priceKES: 'KSh 15,999',
    rating: 4.9,
    reviews: 87,
    inStock: true,
    storeOnly: true,
    description: 'Esports-grade wireless headset with THX Spatial Audio',
    features: ['Wireless', '50mm Drivers', 'THX Audio', 'Noise Cancelling'],
    brand: 'Razer',
    imageUrl: 'https://picsum.photos/seed/blackshark/400/300',
    tags: ['Wireless', 'Esports', 'Best Seller']
  },
  {
    id: 5,
    name: 'SteelSeries Arctis Nova Pro',
    category: 'headset',
    subcategory: 'wireless',
    price: 22999,
    priceKES: 'KSh 22,999',
    rating: 4.8,
    reviews: 54,
    inStock: true,
    storeOnly: false,
    description: 'Premium wireless gaming headset with dual batteries',
    features: ['Dual Battery', 'Active Noise Cancellation', 'Hi-Res Audio', 'AI Noise Cancel'],
    brand: 'SteelSeries',
    imageUrl: 'https://picsum.photos/seed/arctis/400/300',
    tags: ['Premium', 'Wireless', 'ANC']
  },
  {
    id: 6,
    name: 'Logitech G Pro X',
    category: 'headset',
    subcategory: 'wired',
    price: 12999,
    priceKES: 'KSh 12,999',
    rating: 4.5,
    reviews: 112,
    inStock: true,
    storeOnly: true,
    description: 'Professional-grade wired headset with Blue VO!CE',
    features: ['Blue VO!CE', 'Pro-G Drivers', 'DTS Headphone:X 2.0', 'Detachable Mic'],
    brand: 'Logitech',
    imageUrl: 'https://picsum.photos/seed/logitech/400/300',
    tags: ['Wired', 'Pro Gaming', 'Streaming']
  },

  // MICE
  {
    id: 7,
    name: 'Logitech G Pro X Superlight',
    category: 'mouse',
    subcategory: 'wireless',
    price: 14999,
    priceKES: 'KSh 14,999',
    rating: 4.9,
    reviews: 203,
    inStock: true,
    storeOnly: true,
    description: 'Ultra-lightweight wireless gaming mouse',
    features: ['63g Weight', 'HERO 25K Sensor', 'Lightspeed Wireless', '70hr Battery'],
    brand: 'Logitech',
    imageUrl: 'https://picsum.photos/seed/gpro/400/300',
    tags: ['Wireless', 'Lightweight', 'Esports']
  },
  {
    id: 8,
    name: 'Razer DeathAdder V3 Pro',
    category: 'mouse',
    subcategory: 'wireless',
    price: 16999,
    priceKES: 'KSh 16,999',
    rating: 4.7,
    reviews: 89,
    inStock: true,
    storeOnly: false,
    description: 'Ergonomic wireless gaming mouse',
    features: ['Focus Pro 30K Sensor', 'Optical Switches', '90hr Battery', '59g Weight'],
    brand: 'Razer',
    imageUrl: 'https://picsum.photos/seed/deathadder/400/300',
    tags: ['Ergonomic', 'Wireless', 'Pro']
  },

  // KEYBOARDS
  {
    id: 9,
    name: 'Corsair K70 RGB TKL',
    category: 'keyboard',
    subcategory: 'mechanical',
    price: 17999,
    priceKES: 'KSh 17,999',
    rating: 4.6,
    reviews: 76,
    inStock: true,
    storeOnly: true,
    description: 'Tenkeyless mechanical keyboard with RGB',
    features: ['Cherry MX Red', 'PBT Keycaps', '8MB Profile Storage', 'Aluminum Frame'],
    brand: 'Corsair',
    imageUrl: 'https://picsum.photos/seed/k70/400/300',
    tags: ['Mechanical', 'TKL', 'RGB']
  },
  {
    id: 10,
    name: 'Razer Huntsman V2',
    category: 'keyboard',
    subcategory: 'mechanical',
    price: 19999,
    priceKES: 'KSh 19,999',
    rating: 4.8,
    reviews: 65,
    inStock: true,
    storeOnly: true,
    description: 'Optical mechanical keyboard with fast actuation',
    features: ['Optical Switches', 'Doubleshot PBT', 'Sound Dampening', 'USB Passthrough'],
    brand: 'Razer',
    imageUrl: 'https://picsum.photos/seed/huntsman/400/300',
    tags: ['Optical', 'Mechanical', 'Premium']
  },

  // PC COMPONENTS
  {
    id: 11,
    name: 'NVIDIA RTX 4070 Ti',
    category: 'pc-component',
    subcategory: 'gpu',
    price: 145999,
    priceKES: 'KSh 145,999',
    rating: 4.9,
    reviews: 42,
    inStock: true,
    storeOnly: true,
    description: 'High-performance graphics card for 4K gaming',
    features: ['DLSS 3', 'Ray Tracing', '12GB GDDR6X', 'AV1 Encoding'],
    brand: 'NVIDIA',
    imageUrl: 'https://picsum.photos/seed/rtx4070/400/300',
    tags: ['GPU', '4K', 'Ray Tracing']
  },
  {
    id: 12,
    name: 'AMD Ryzen 7 7800X3D',
    category: 'pc-component',
    subcategory: 'cpu',
    price: 89999,
    priceKES: 'KSh 89,999',
    rating: 4.8,
    reviews: 38,
    inStock: true,
    storeOnly: false,
    description: 'Gaming-focused processor with 3D V-Cache',
    features: ['8 Cores/16 Threads', '3D V-Cache', '5.0GHz Boost', 'AM5 Socket'],
    brand: 'AMD',
    imageUrl: 'https://picsum.photos/seed/ryzen/400/300',
    tags: ['CPU', 'Gaming', 'AMD']
  },
  {
    id: 13,
    name: 'Corsair Dominator Platinum RGB',
    category: 'pc-component',
    subcategory: 'ram',
    price: 34999,
    priceKES: 'KSh 34,999',
    rating: 4.7,
    reviews: 29,
    inStock: true,
    storeOnly: true,
    description: 'Premium RGB DDR5 memory',
    features: ['DDR5 6000MHz', 'RGB Lighting', 'Intel XMP 3.0', 'AMD EXPO'],
    brand: 'Corsair',
    imageUrl: 'https://picsum.photos/seed/dominator/400/300',
    tags: ['RAM', 'DDR5', 'RGB']
  },
  {
    id: 14,
    name: 'Samsung 980 Pro SSD 2TB',
    category: 'pc-component',
    subcategory: 'storage',
    price: 28999,
    priceKES: 'KSh 28,999',
    rating: 4.9,
    reviews: 156,
    inStock: true,
    storeOnly: false,
    description: 'High-speed PCIe 4.0 NVMe SSD',
    features: ['PCIe 4.0', '7000MB/s Read', '2TB Capacity', '5-year Warranty'],
    brand: 'Samsung',
    imageUrl: 'https://picsum.photos/seed/980pro/400/300',
    tags: ['SSD', 'NVMe', 'Fast']
  }
]

export const brands = [
  'Sony', 'Microsoft', 'Nintendo', 'Razer', 'Logitech',
  'Corsair', 'SteelSeries', 'NVIDIA', 'AMD', 'Samsung',
  'Intel', 'HyperX', 'ASUS', 'MSI', 'Gigabyte'
]

export const priceRanges = [
  { label: 'Under KSh 10,000', min: 0, max: 10000 },
  { label: 'KSh 10,000 - 30,000', min: 10000, max: 30000 },
  { label: 'KSh 30,000 - 60,000', min: 30000, max: 60000 },
  { label: 'KSh 60,000 - 100,000', min: 60000, max: 100000 },
  { label: 'Over KSh 100,000', min: 100000, max: Infinity }
]

// src/everyone-pages/products/data/productsData.js

export const productData = {
  id: 1,
  name: 'PlayStation 5 Console',
  category: 'console',
  subcategory: 'playstation',
  brand: 'Sony',
  price: 84999,
  priceKES: 'KSh 84,999',
  originalPrice: 89999,
  discount: 5,
  rating: 4.8,
  reviewCount: 128, // CHANGED from 'reviews' to 'reviewCount'
  inStock: true,
  storeOnly: true,
  storeAvailability: [
    { location: 'Nairobi Store', stock: 12, address: 'Tom Mboya Street' },
    { location: 'Westlands Store', stock: 5, address: 'Sarit Centre' }
  ],

  images: [
    'https://picsum.photos/seed/ps5-1/800/600',
    'https://picsum.photos/seed/ps5-2/800/600',
    'https://picsum.photos/seed/ps5-3/800/600',
    'https://picsum.photos/seed/ps5-4/800/600'
  ],

  description: 'Experience next-generation gaming with the PlayStation 5 Console. Featuring lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.',

  highlights: [
    'Lightning-fast loading with ultra-high speed SSD',
    'Deeper immersion with haptic feedback and adaptive triggers',
    'Incredible 4K gaming at 120 FPS',
    'Backward compatible with most PS4 games',
    'Supports ray tracing for realistic lighting'
  ],

  specifications: {
    'Model': 'PlayStation 5',
    'Storage': '825GB SSD',
    'CPU': 'AMD Zen 2 (8-core)',
    'GPU': 'AMD RDNA 2 (10.28 TFLOPS)',
    'Memory': '16GB GDDR6',
    'Video Output': '4K at 120Hz, 8K',
    'Audio': 'Tempest 3D AudioTech',
    'Ports': 'USB Type-A, USB Type-C, HDMI 2.1',
    'Dimensions': '390 × 104 × 260 mm',
    'Weight': '4.5 kg',
    'Warranty': '1 Year Manufacturer Warranty'
  },

  features: [
    {
      icon: '🎮',
      title: 'Ultra-fast SSD',
      description: 'Experience almost instant load times for installed games'
    },
    {
      icon: '🎯',
      title: 'Adaptive Triggers',
      description: 'Feel varying levels of force and tension in your actions'
    },
    {
      icon: '🔊',
      title: '3D Audio',
      description: 'Immerse yourself in soundscapes with Tempest 3D AudioTech'
    },
    {
      icon: '🎨',
      title: 'Ray Tracing',
      description: 'Realistic lighting and reflections for enhanced realism'
    }
  ],

  includedItems: [
    'PS5 Console',
    'DualSense Wireless Controller',
    'HDMI Cable',
    'AC Power Cord',
    'USB Cable',
    'Base',
    'Quick Start Guide'
  ],

  relatedProducts: [
    {
      id: 2,
      name: 'DualSense Wireless Controller',
      price: 8999,
      priceKES: 'KSh 8,999',
      category: 'accessory',
      image: 'https://picsum.photos/seed/dualsense/400/300'
    },
    {
      id: 3,
      name: 'Pulse 3D Wireless Headset',
      price: 12999,
      priceKES: 'KSh 12,999',
      category: 'headset',
      image: 'https://picsum.photos/seed/pulse3d/400/300'
    },
    {
      id: 4,
      name: 'PS5 Media Remote',
      price: 4999,
      priceKES: 'KSh 4,999',
      category: 'accessory',
      image: 'https://picsum.photos/seed/mediaremote/400/300'
    }
  ],

  // This is now the only 'reviews' property - an array of review objects
  reviews: [
    {
      id: 1,
      user: 'Brian K.',
      rating: 5,
      date: '2024-02-15',
      title: 'Best Console Ever!',
      comment: 'The haptic feedback on the DualSense controller is mind-blowing. Games feel completely different and immersive.',
      verified: true
    },
    {
      id: 2,
      user: 'Sarah M.',
      rating: 4,
      date: '2024-02-10',
      title: 'Incredible Performance',
      comment: 'Load times are practically non-existent. The SSD makes a huge difference compared to previous generations.',
      verified: true
    },
    {
      id: 3,
      user: 'David O.',
      rating: 5,
      date: '2024-02-05',
      title: 'Worth Every Penny',
      comment: 'The 4K graphics and ray tracing are stunning. Demon\'s Souls remake looks absolutely incredible.',
      verified: false
    }
  ]
}