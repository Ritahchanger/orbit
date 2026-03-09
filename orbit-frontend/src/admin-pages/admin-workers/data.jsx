import {
  Shield,
  Building,
  Crown,
  User as UserIcon,
} from 'lucide-react';
export const roles = [
  { id: 'superadmin', name: 'Super Admin', icon: Crown, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'admin', name: 'Admin', icon: Shield, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'manager', name: 'Manager', icon: Building, color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'cashier', name: 'Cashier', icon: UserIcon, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }, // Added this back
  { id: 'staff', name: 'Staff', icon: UserIcon, color: 'bg-purple-500/10 text-gray-400 border-purple-500/20' }, // Added this back
];