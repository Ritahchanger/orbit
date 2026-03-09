import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Rocket,
  Store,
  BarChart3,
  Shield,
  Users,
  ChevronRight,
  Star,
  Globe,
  LogIn,
  Smartphone,
  Cloud,
  TrendingUp,
  Package,
  CreditCard,
  Settings,
  HelpCircle,
  Mail,
  Phone,
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const navLinks = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Solutions",
      path: "/solutions",
      dropdown: [
        {
          name: "Multi-Business Management",
          path: "/solutions/multi-business",
          icon: Globe,
        },
        {
          name: "Multi-Store Operations",
          path: "/solutions/multi-store",
          icon: Store,
        },
        {
          name: "Inventory Control",
          path: "/solutions/inventory",
          icon: Package,
        },
        {
          name: "Sales Analytics",
          path: "/solutions/analytics",
          icon: BarChart3,
        },
        {
          name: "Payment Processing",
          path: "/solutions/payments",
          icon: CreditCard,
        },
        { name: "Mobile POS", path: "/solutions/mobile-pos", icon: Smartphone },
      ],
    },
    {
      name: "Features",
      path: "/features",
      dropdown: [
        {
          name: "Real-Time Tracking",
          path: "/features/real-time",
          icon: TrendingUp,
        },
        { name: "Role-Based Access", path: "/features/rbac", icon: Shield },
        { name: "Team Management", path: "/features/team", icon: Users },
        { name: "Cloud Platform", path: "/features/cloud", icon: Cloud },
        { name: "API Integration", path: "/features/api", icon: Settings },
        {
          name: "Customer Engagement",
          path: "/features/engagement",
          icon: Star,
        },
      ],
    },
    {
      name: "Industries",
      path: "/industries",
      dropdown: [
        { name: "Retail Chains", path: "/industries/retail" },
        { name: "Restaurants", path: "/industries/restaurants" },
        { name: "E-commerce", path: "/industries/ecommerce" },
        { name: "Wholesale", path: "/industries/wholesale" },
        { name: "Franchises", path: "/industries/franchises" },
      ],
    },
    {
      name: "Pricing",
      path: "/pricing",
    },
    {
      name: "Resources",
      path: "/resources",
      dropdown: [
        { name: "Documentation", path: "/docs" },
        { name: "API Reference", path: "/api-docs" },
        { name: "Blog", path: "/blog" },
        { name: "Case Studies", path: "/case-studies" },
        { name: "Support", path: "/support" },
      ],
    },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-3"
          : "bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              className={`p-2 rounded-xl transition-all duration-300 ${
                scrolled ? "bg-blue-600" : "bg-white/20 group-hover:bg-white/30"
              }`}
            >
              <Rocket
                className={`w-6 h-6 ${scrolled ? "text-white" : "text-white"}`}
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-bold text-2xl tracking-tight ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                Orbit
              </span>
              <span
                className={`text-xs font-medium -mt-1 ${
                  scrolled ? "text-blue-600" : "text-blue-200"
                }`}
              >
                Enterprise Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div
                key={link.path}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.dropdown ? (
                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-1 ${
                      scrolled
                        ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === link.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    to={link.path}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 inline-block ${
                      scrolled
                        ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.name}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {link.dropdown && activeDropdown === link.name && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                    <div className="py-2">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
                        >
                          {item.icon && (
                            <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                          )}
                          <span className="text-sm font-medium flex-1">
                            {item.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/contact"
              className={`p-2 rounded-lg transition-colors duration-200 ${
                scrolled
                  ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Phone className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                scrolled
                  ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
            <Link
              to="/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-0.5"
            >
              Request Demo
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
              scrolled
                ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                : "text-white hover:text-white hover:bg-white/10"
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-gray-200/20 animate-slideDown">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <div key={link.path}>
                  {link.dropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === link.name ? null : link.name,
                          )
                        }
                        className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                      >
                        <span className="font-medium">{link.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            activeDropdown === link.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {activeDropdown === link.name && (
                        <div className="pl-4 space-y-1 mt-1">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.icon && <item.icon className="w-4 h-4" />}
                              <span className="text-sm">{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200/20 space-y-3">
              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                to="/demo"
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg"
                onClick={() => setIsOpen(false)}
              >
                Request Demo
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
