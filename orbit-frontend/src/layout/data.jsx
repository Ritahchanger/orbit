import {
  MapPin,
  Users,
  Mouse,
  Keyboard,
  Cpu,
  Gamepad2,
  Headphones,
  Monitor,
  Armchair,
  Camera,
  Radio,
  Wifi,
  Server,
  Cable,
  Lightbulb,
  Fan,
  Battery,
  Shield,
  Smartphone,
  Sun,
  Gamepad,
  Speaker,
  HardDrive,
  MemoryStick,
  Home,
} from "lucide-react";
export const initialSearchSuggestions = [
  {
    id: 1,
    name: "PlayStation 5 Console",
    category: "console",
    price: 85000,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Gaming Headset RGB",
    category: "peripheral",
    price: 12000,
    rating: 4.5,
  },
  {
    id: 3,
    name: "Gaming PC RTX 4070",
    category: "pc",
    price: 250000,
    rating: 4.9,
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    category: "peripheral",
    price: 8000,
    rating: 4.3,
  },
  {
    id: 5,
    name: "Xbox Series X",
    category: "console",
    price: 75000,
    rating: 4.7,
  },
  {
    id: 6,
    name: "Gaming Chair Pro",
    category: "accessory",
    price: 45000,
    rating: 4.6,
  },
];

export const storeEvents = [
  { day: "Fri", event: "FIFA Tournament", time: "7PM" },
  { day: "Sat", event: "VR Demo Day", time: "All Day" },
  { day: "Sun", event: "Family Gaming", time: "2PM" },
];

// navData.js

export const mainNavLinks = [
  {
    to: "/",
    label: "Home",
    icon: <Home size={18} />,
    badge: null,
    activeColor: "text-primary",
  },
  {
    to: "/products",
    label: "Visit Store",
    icon: <MapPin size={18} />,
    badge: null,
    activeColor: "text-primary",
  },
  {
    to: "/setup-consultation",
    label: "Setup Consultation",
    icon: "🛠️",
    badge: { text: "FREE", color: "bg-[#00FF88]/20 text-[#00FF88]" },
    activeColor: "text-[#00FF88]",
  },
  // {
  //     to: '/events',
  //     label: 'Store Events',
  //     icon: <Calendar size={18} />,
  //     badge: { text: '3 TODAY', color: 'bg-secondary/20 text-secondary' },
  //     activeColor: 'text-secondary'
  // },
  {
    to: "/community",
    label: "Community",
    icon: <Users size={18} />,
    badge: null,
    activeColor: "text-primary",
  },
];

export const categories = [
  // Gaming Categories
  {
    name: "Gaming PCs",
    icon: <Cpu className="text-3xl" size={32} />,
    count: 45,
    link: "/products/category/gaming-pcs",
  },
  {
    name: "Gaming Laptops",
    icon: <Gamepad2 className="text-3xl" size={32} />,
    count: 38,
    link: "/products/category/gaming-laptops",
  },
  {
    name: "Consoles",
    icon: <Gamepad className="text-3xl" size={32} />,
    count: 42,
    link: "/products/category/consoles",
  },
  {
    name: "Gaming Monitors",
    icon: <Monitor className="text-3xl" size={32} />,
    count: 28,
    link: "/products/category/gaming-monitors",
  },
  {
    name: "Gaming Headsets",
    icon: <Headphones className="text-3xl" size={32} />,
    count: 35,
    link: "/products/category/gaming-headsets",
  },
  {
    name: "Mechanical Keyboards",
    icon: <Keyboard className="text-3xl" size={32} />,
    count: 31,
    link: "/products/category/mechanical-keyboards",
  },
  {
    name: "Gaming Mice",
    icon: <Mouse className="text-3xl" size={32} />,
    count: 29,
    link: "/products/category/gaming-mice",
  },
  {
    name: "Games",
    icon: <Gamepad className="text-3xl" size={32} />,
    count: 156,
    link: "/products/category/games",
  },
  {
    name: "Gaming Chairs",
    icon: <Armchair className="text-3xl" size={32} />,
    count: 18,
    link: "/products/category/gaming-chairs",
  },
  {
    name: "Streaming Gear",
    icon: <Camera className="text-3xl" size={32} />,
    count: 23,
    link: "/products/category/streaming-gear",
  },
  {
    name: "Gaming Speakers",
    icon: <Speaker className="text-3xl" size={32} />,
    count: 22,
    link: "/products/category/gaming-speakers",
  },

  // Storage & Memory
  {
    name: "Storage",
    icon: <HardDrive className="text-3xl" size={32} />,
    count: 67,
    link: "/products/category/storage",
  },
  {
    name: "Memory",
    icon: <MemoryStick className="text-3xl" size={32} />,
    count: 43,
    link: "/products/category/memory",
  },

  // Networking
  {
    name: "Cables",
    icon: <Cable className="text-3xl" size={32} />,
    count: 89,
    link: "/products/category/cables",
  },
  {
    name: "Routers",
    icon: <Wifi className="text-3xl" size={32} />,
    count: 34,
    link: "/products/category/routers",
  },
  {
    name: "Servers",
    icon: <Server className="text-3xl" size={32} />,
    count: 12,
    link: "/products/category/servers",
  },

  // Electrical Infrastructure
  {
    name: "Wiring & Cables",
    icon: <Cable className="text-3xl" size={32} />,
    count: 95,
    link: "/products/category/wiring-&-cables",
  },
  {
    name: "Switches & Sockets",
    icon: <Radio className="text-3xl" size={32} />,
    count: 76,
    link: "/products/category/switches-&-sockets",
  },
  {
    name: "Lighting Solutions",
    icon: <Lightbulb className="text-3xl" size={32} />,
    count: 58,
    link: "/products/category/lighting-solutions",
  },
  {
    name: "Ventilation Systems",
    icon: <Fan className="text-3xl" size={32} />,
    count: 27,
    link: "/products/category/ventilation-systems",
  },

  // Energy & Security
  {
    name: "Energy Management",
    icon: <Battery className="text-3xl" size={32} />,
    count: 31,
    link: "/products/category/energy-management",
  },
  {
    name: "Security Systems",
    icon: <Shield className="text-3xl" size={32} />,
    count: 44,
    link: "/products/category/security-systems",
  },
  {
    name: "Automation",
    icon: <Smartphone className="text-3xl" size={32} />,
    count: 36,
    link: "/products/category/automation",
  },

  // Additional
  {
    name: "Cameras",
    icon: <Camera className="text-3xl" size={32} />,
    count: 52,
    link: "/products/category/cameras",
  },
  {
    name: "Solar Products",
    icon: <Sun className="text-3xl" size={32} />,
    count: 19,
    link: "/products/category/solar-products",
  },
];

export const brands = [
  "PlayStation",
  "Xbox",
  "Nintendo",
  "Razer",
  "Logitech",
  "Corsair",
  "SteelSeries",
  "HyperX",
];
