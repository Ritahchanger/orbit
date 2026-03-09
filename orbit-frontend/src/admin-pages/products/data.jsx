import {
  Gamepad2,
  Monitor,
  Headphones,
  Keyboard,
  Mouse,
  Speaker,
  HardDrive,
  Gamepad,
  Zap,
  Sun,
  Cpu,
  Camera,
  MemoryStick,
  Cable,
  Fan,
  Router,
  Server,
  Battery,
  Radio,
} from "lucide-react";
const Chair = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 9h14M5 15h14M12 9v6M7 21h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
  </svg>
);
// export const daily_Sales = [
//     {
//         id: 1,
//         productName: 'Alienware Aurora R15',
//         sku: 'AW-R15-001',
//         quantity: 1,
//         amount: 2500,
//         paymentMethod: 'mpesa',
//         customer: 'John Kamau',
//         phone: '0712345678',
//         time: '09:30 AM',
//         date: '2024-01-20',
//         status: 'Completed',
//         autoAdded: true
//     },
//     {
//         id: 2,
//         productName: 'PlayStation 5',
//         sku: 'PS5-DIGITAL',
//         quantity: 2,
//         amount: 1000,
//         paymentMethod: 'cash',
//         customer: 'Sarah Mwangi',
//         phone: '0723456789',
//         time: '11:45 AM',
//         date: '2024-01-20',
//         status: 'Completed',
//         autoAdded: false
//     },
//     {
//         id: 3,
//         productName: 'Razer BlackShark V2 Pro',
//         sku: 'RAZER-BS-V2-PRO',
//         quantity: 3,
//         amount: 540,
//         paymentMethod: 'paybill',
//         customer: 'Mike Ochieng',
//         phone: '0734567890',
//         time: '02:15 PM',
//         date: '2024-01-20',
//         status: 'Pending',
//         autoAdded: false
//     },
//     {
//         id: 4,
//         productName: 'Xbox Series X',
//         sku: 'XBOX-X-1TB',
//         quantity: 1,
//         amount: 550,
//         paymentMethod: 'mpesa',
//         customer: 'Jane Akinyi',
//         phone: '0745678901',
//         time: '03:45 PM',
//         date: '2024-01-20',
//         status: 'Completed',
//         autoAdded: true
//     },
//     {
//         id: 5,
//         productName: 'Logitech G Pro X Superlight',
//         sku: 'LOG-GPX-SUPER',
//         quantity: 1,
//         amount: 130,
//         paymentMethod: 'cash',
//         customer: 'David Wambua',
//         phone: '0756789012',
//         time: '05:20 PM',
//         date: '2024-01-20',
//         status: 'Completed',
//         autoAdded: false
//     },
// ]

// Gaming Device Categories
export const categories = [
  { id: "consoles", name: "Gaming Consoles", icon: Gamepad2, count: 35 },
  { id: "gaming-monitors", name: "Gaming Monitors", icon: Monitor, count: 18 },
  {
    id: "gaming-headsets",
    name: "Gaming Headsets",
    icon: Headphones,
    count: 45,
  },
  {
    id: "mechanical-keyboards",
    name: "Mechanical Keyboards",
    icon: Keyboard,
    count: 32,
  },
  { id: "gaming-mice", name: "Gaming Mice", icon: Mouse, count: 56 },
  { id: "gaming-chairs", name: "Gaming Chairs", icon: Chair, count: 22 },
  { id: "streaming-gear", name: "Streaming Gear", icon: Speaker, count: 27 },
  { id: "storage", name: "Gaming Storage", icon: HardDrive, count: 15 },
  { id: "gaming-pcs", name: "Gaming PCS", icon: Cpu, count: 42 },
  { id: "games", name: "Games", icon: Gamepad, count: 67 },
  { id: "Wiring & Cables", name: "Wiring & Cables", icon: Cable, count: 23 },
  {
    id: "Switches & Sockets",
    name: "Switches & Sockets",
    icon: Radio,
    count: 19,
  },
  {
    id: "Lighting Solutions",
    name: "Lighting Solutions",
    icon: Zap,
    count: 31,
  },
  {
    id: "Ventilation Systems",
    name: "Ventilation Systems",
    icon: Fan,
    count: 14,
  },
  { id: "gaming-speakers", name: "Gaming speakers", icon: Speaker, count: 28 },
  { id: "cameras", name: "Cameras", icon: Camera, count: 17 },
  { id: "memory", name: "RAM & Memory", icon: MemoryStick, count: 24 },
  { id: "cables", name: "Gaming Cables", icon: Cable, count: 38 },
  { id: "routers", name: "Gaming Routers", icon: Router, count: 12 },
  { id: "servers", name: "Gaming Servers", icon: Server, count: 8 },
  { id: "Solar Products", name: "Solar Products", icon: Sun, count: 9 },
  { id: "Automation", name: "Automation", icon: Radio, count: 15 },
  {
    id: "Energy Management",
    name: "Energy Management",
    icon: Battery,
    count: 11,
  },
];

// Payment Methods for Gaming Devices
export const paymentMethods = [
  { id: "all", name: "All Methods", color: "bg-gray-500" },
  // { id: 'mpesa', name: 'M-pesa STK', color: 'bg-green-500' },
  { id: "cash", name: "Cash", color: "bg-yellow-500" },
  { id: "paybill", name: "PayBill", color: "bg-blue-500" },
  { id: "card", name: "Credit Card", color: "bg-purple-500" },
];
