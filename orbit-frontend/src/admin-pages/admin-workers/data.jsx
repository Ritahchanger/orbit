import {
  Shield,
  Building,
  Crown,
  User as UserIcon,
} from 'lucide-react';
export const roles = [
  { id: 'superadmin', name: 'Super Admin', icon: Crown, color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' },
  { id: 'admin', name: 'Admin', icon: Shield, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' },
  { id: 'manager', name: 'Manager', icon: Building, color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' },
  { id: 'cashier', name: 'Cashier', icon: UserIcon, color: 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30' }, // Added this back
  { id: 'staff', name: 'Staff', icon: UserIcon, color: 'bg-purple-50 dark:bg-purple-500/10 text-gray-700 dark:text-gray-400 border-purple-200 dark:border-purple-500/30' }, // Added this back
];