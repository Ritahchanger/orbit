// ecommerceData.js
import {
  ShoppingBag,
  Tag,
  Users,
  Settings,
  BarChart3,
  Package,
  Truck,
  Percent,
  Star,
  Image,
  Globe,
  DollarSign,
  Gift,
  MessageCircle,
  CreditCard,
  Home,
  FileText,
  Layers,
} from "lucide-react";
export const getAllowedEcommerceNavItems = (userRole) => {
  const isSuperAdmin = userRole === "superadmin";
  const isAdmin = userRole === "admin" || isSuperAdmin;
  
  return [
    {
      name: "Dashboard",
      path: "/admin/ecommerce",
      icon: Home,
      type: "link",
    },
    {
      name: "Products",
      icon: Package,
      type: "dropdown",
      items: [
        { name: "All Products", path: "/admin/ecommerce?products=true", icon: Package },
      ]
    },
    {
      name: "Sales",
      icon: DollarSign,
      type: "dropdown",
      items: [
        { name: "Orders", path: "/admin/ecommerce/orders", icon: ShoppingBag },
        { name: "Transactions", path: "/admin/ecommerce/transactions", icon: CreditCard },
        { name: "Shipping", path: "/admin/ecommerce/shipping", icon: Truck },
        { name: "Refunds", path: "/admin/ecommerce/refunds", icon: FileText },
        { name: "Discounts", path: "/admin/ecommerce/discounts", icon: Percent },
      ],
    },
    {
      name: "Marketing",
      icon: Gift,
      type: "dropdown",
      items: [
        { name: "Promotions", path: "/admin/ecommerce/promotions", icon: Percent },
        { name: "Coupons", path: "/admin/ecommerce/coupons", icon: Gift },
        { name: "Email Campaigns", path: "/admin/ecommerce/email-campaigns", icon: MessageCircle },
        { name: "SEO", path: "/admin/ecommerce/seo", icon: Globe },
      ],
    },
    {
      name: "Customers",
      icon: Users,
      type: "dropdown",
      items: [
        { name: "All Customers", path: "/admin/ecommerce/customers", icon: Users },
        { name: "Customer Groups", path: "/admin/ecommerce/customer-groups", icon: Users },
        { name: "Wishlists", path: "/admin/ecommerce/wishlists", icon: Star },
      ],
    },
    {
      name: "Content",
      icon: Image,
      type: "dropdown",
      items: [
        { name: "Pages", path: "/admin/ecommerce/pages", icon: FileText },
        { name: "Blog", path: "/admin/ecommerce/blog", icon: FileText },
        { name: "Banners", path: "/admin/ecommerce/banners", icon: Image },
        { name: "FAQs", path: "/admin/ecommerce/faqs", icon: MessageCircle },
      ],
    },
    {
      name: "Reports",
      icon: BarChart3,
      type: "dropdown",
      items: [
        { name: "Sales Reports", path: "/admin/ecommerce/reports/sales", icon: BarChart3 },
        { name: "Customer Reports", path: "/admin/ecommerce/reports/customers", icon: Users },
        { name: "Product Reports", path: "/admin/ecommerce/reports/products", icon: Package },
        { name: "Inventory Reports", path: "/admin/ecommerce/reports/inventory", icon: Package },
      ],
      requiredRole: "admin",
    },
    {
      name: "Settings",
      icon: Settings,
      type: "dropdown",
      items: [
        { name: "Store Settings", path: "/admin/ecommerce/settings/store", icon: Settings },
        { name: "Payment Methods", path: "/admin/ecommerce/settings/payments", icon: CreditCard },
        { name: "Shipping Methods", path: "/admin/ecommerce/settings/shipping", icon: Truck },
        { name: "Tax Settings", path: "/admin/ecommerce/settings/tax", icon: DollarSign },
        { name: "Email Templates", path: "/admin/ecommerce/settings/email", icon: MessageCircle },
      ],
      requiredRole: "admin",
    },
  ].filter(item => {
    if (item.requiredRole === "admin" && !isAdmin) return false;
    if (item.requiredRole === "superadmin" && !isSuperAdmin) return false;
    return true;
  });
};