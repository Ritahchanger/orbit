import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Search,
  Menu,
  X,
  Gamepad2,
  ChevronDown,
  Gift,
  MapPin,
  Calendar,
} from "lucide-react";

import { openModal } from "../../../store/features/SearchModalSlice";
import { setSearchQuery } from "../../../store/features/SearchModalSlice";
import { useProducts } from "../../../globals/hooks/useProduct";

import {
  storeEvents,
  mainNavLinks,
  categories,
  initialSearchSuggestions,
} from "../../data";

// import { mainNavLinks, categories, storeEvents, initialSearchSuggestions } from '../../data'
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const searchRef = useRef(null);

  // Use products hook
  const { products, handleSearch } = useProducts();

  // Recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("gamingRecentSearches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim() === "") {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter suggestions based on input
    const filtered = initialSearchSuggestions.filter(
      (item) =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase()),
    );

    setSearchSuggestions(filtered.slice(0, 5));
    setShowSuggestions(true);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchInput.trim() === "") return;

    // Update recent searches
    const updatedSearches = [
      { query: searchInput, timestamp: new Date().toISOString() },
      ...recentSearches.filter((s) => s.query !== searchInput),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "gamingRecentSearches",
      JSON.stringify(updatedSearches),
    );

    // Dispatch search action
    dispatch(setSearchQuery(searchInput));
    handleSearch(searchInput);

    // Close search bar
    setIsSearchOpen(false);
    setSearchInput("");
    setShowSuggestions(false);
  };

  // Handle key press (Enter to search, Escape to close)
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion) => {
    dispatch(
      openModal({
        id: suggestion.id,
        name: suggestion.name,
        category: suggestion.category,
        price: suggestion.price,
        rating: suggestion.rating,
        description: `High-performance ${suggestion.name} for ultimate gaming experience`,
        features: [
          "Premium Quality",
          "Warranty Included",
          "Free Setup Support",
        ],
        inStock: true,
        storeAvailability: true,
        imageUrl: `https://picsum.photos/seed/${suggestion.id}/400/300`,
        discount: suggestion.category === "console" ? 15 : 0,
        specs: {
          brand: suggestion.category === "console" ? "Sony" : "GamingPro",
          model: "2024 Edition",
          condition: "new",
          warranty: "1 Year",
        },
        tags: ["Best Seller", "Gaming", "Premium"],
        warranty: "1 Year Manufacturer Warranty",
        reviewCount: 42,
      }),
    );

    // Update recent searches
    const updatedSearches = [
      { query: suggestion.name, timestamp: new Date().toISOString() },
      ...recentSearches.filter((s) => s.query !== suggestion.name),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem(
      "gamingRecentSearches",
      JSON.stringify(updatedSearches),
    );

    // Close search
    setIsSearchOpen(false);
    setSearchInput("");
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("gamingRecentSearches");
  };

  return (
    <>
      {/* Top Announcement Bar - Updated for advertising */}
      <div className="bg-linear-to-r from-primary to-[#00D4FF] text-white text-center  px-4 flex items-center justify-center">
        <p className="text-sm font-medium flex flex-col md:flex-row items-center justify-center gap-2  text-white pt-[8px]">
          <MapPin size={16} />
          VISIT OUR STORE: Tom Mboya Street (Bahind National Archives, Simara
          Mall 3rd Floor Shop 61 ) •
          <span className="font-bold ml-2  text-white">
            🎮 FREE SETUP CONSULTATION FOR ALL VISITORS!
          </span>
        </p>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-dark/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Gamepad2 className="text-primary" size={32} />
                <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-heading font-bold bg-linear-to-r from-primary to-[#00D4FF] bg-clip-text text-transparent">
                  MEGA
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveCategory("categories")}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button className="flex items-center space-x-1 text-gray-300 hover:text-white transition">
                  <span>Explore Products</span>
                  <ChevronDown size={16} />
                </button>

                {activeCategory === "categories" && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-dark-light border border-gray-700 rounded-sm shadow-xl p-2">
                    {categories.map((cat) => (
                      <div key={cat.name} className="group">
                        <Link
                          to={cat.link}
                          className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-sm transition"
                          onClick={() => setActiveCategory(null)}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{cat.icon}</span>
                            <div>
                              <p className="font-medium text-white">
                                {cat.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                View at our store
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            size={16}
                            className="text-gray-400 transform -rotate-90"
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Navigation Links */}
              {mainNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `font-medium transition flex items-center gap-2 ${isActive ? link.activeColor : "text-gray-300 hover:text-white"}`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Store Events Badge */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary text-sm font-medium rounded-sm hover:bg-secondary/20 transition">
                  <Calendar size={16} />
                  Today's Events
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 bg-dark-light border border-gray-700 rounded-sm shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <h4 className="font-semibold text-white mb-3">
                    This Week at Mega Gamers
                  </h4>
                  <div className="space-y-3">
                    {storeEvents.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-medium text-sm">
                            {event.event}
                          </p>
                          <p className="text-gray-400 text-xs">{event.time}</p>
                        </div>
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-sm">
                          {event.day}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="#"
                    className="block mt-4 text-center text-primary hover:text-[#00D4FF] text-sm font-medium"
                  >
                    View All Events →
                  </Link>
                </div>
              </div>

              {/* <button
                className="bg-blue-500 px-3 py-1 rounded-[2px]"
                onClick={() => {
                  navigate("/admin/dashboard");
                }}
              >
                Admin
              </button> */}
              {/* Search Button */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setShowSuggestions(false);
                }}
                className="p-2 text-gray-400 hover:text-white transition relative"
                aria-label="Search products"
              >
                <Search size={20} />
                {products?.searchQuery && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                )}
              </button>

              {/* Join Community CTA */}

              {/* User Account */}
              {/* <Link to="/account" className="p-2 text-gray-400 hover:text-white transition" aria-label="My Account">
                <User size={20} />
              </Link> */}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Search Bar with Suggestions */}
          {isSearchOpen && (
            <SearchBar
              searchInput={searchInput}
              handleSearchChange={handleSearchChange}
              handleKeyPress={handleKeyPress}
              handleSearchSubmit={handleSearchSubmit}
              showSuggestions={showSuggestions}
              recentSearches={recentSearches}
              clearRecentSearches={clearRecentSearches}
              setSearchInput={setSearchInput}
              searchSuggestions={searchSuggestions}
              searchRef={searchRef}
            />
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-dark-light border-t border-gray-800">
            <div className="container mx-auto px-4 py-4">
              {/* Store Info */}
              {/* <div className="mb-6 p-4 bg-gray-900 rounded-sm">
                <div className="flex items-start space-x-3 mb-4">
                  <MapPin className="text-primary mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-white">Store Location</h4>
                    <p className="text-gray-400 text-sm">Tom Mboya Street, Near National Archives</p>
                    <p className="text-gray-400 text-sm mt-1">Open: 9AM-9PM (Mon-Sat)</p>
                  </div>
                </div>
                <Link
                  to="/visit"
                  className="block w-full text-center bg-primary hover:bg-blue-600 text-white py-2 rounded-sm font-medium transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Directions & Details
                </Link>
              </div> */}

              {/* Mobile Categories */}
              <div className="mb-6">
                <h3 className="text-gray-400 text-sm font-semibold mb-3">
                  EXPLORE PRODUCTS
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      to={cat.link}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-800 rounded-sm transition text-sm md:text-lg "
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-white">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2 mb-6">
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-sm text-lg md:text-sm transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2 text-sm md:text-lg">
                      {link.icon}
                      {link.label}
                    </span>
                    {link.badge && (
                      <span
                        className={`text-sm md:text-lg  ${link.badge.color} px-2 py-1 rounded-sm`}
                      >
                        {link.badge.text}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile CTA */}
              <div className="space-y-3">
                <Link
                  to="/join"
                  className="flex w-full text-center text-sm md:text-lg  bg-linear-to-r from-primary to-[#00D4FF] text-white py-3 rounded-sm font-semibold transition flex items-center justify-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Gift size={18} />
                  JOIN FOR EXCLUSIVE DEALS
                </Link>
                {/* <Link
                  to="/account"
                  className="block w-full text-center border border-gray-700 text-gray-300 py-3 rounded-sm font-medium hover:bg-gray-800 transition uppercase text-sm md:text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Account
                </Link> */}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
