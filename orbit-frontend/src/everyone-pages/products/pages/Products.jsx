// src/everyone-pages/products/pages/Products.jsx
import { useState, useEffect } from "react";

import Layout from "../../../layout/everyone-layout/Layout";

import { Filter, Grid, List, MapPin, Gift } from "lucide-react";

import ProductGrid from "../components/ProductGrid";

import { productCategories } from "../data/categoriesData";

import heroImage1 from "../../../assets/hero-section/hero-section2.png";

import heroImage2 from "../../../assets/hero-section/hero-section3.png";

import heroImage3 from "../../../assets/hero-section/hero-section4.png";

import heroImage4 from "../../../assets/hero-section/hero-section5.png";

import "./Product.css";

import { useNavigate } from "react-router-dom";

// Hero background images array
const heroBackgrounds = [
  {
    id: 1,
    url: heroImage1,
    alt: "Gaming Setup 1",
  },
  {
    id: 2,
    url: heroImage2,
    alt: "Gaming Setup 2",
  },
  {
    id: 3,
    url: heroImage3,
    alt: "Gaming Setup 3",
  },
  {
    id: 4,
    url: heroImage4,
    alt: "Gaming Setup 4",
  },
];

const Products = () => {
  const [activeFilters, setActiveFilters] = useState({
    category: null,
    brands: [],
    priceRange: null,
    inStock: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Hero carousel state
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);

  const navigate = useNavigate();

  // Auto-rotate backgrounds every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) =>
        prevIndex === heroBackgrounds.length - 1 ? 0 : prevIndex + 1,
      );
    }, 2000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNavigateSetup = () => {
    navigate("/setup-consultation", {
      state: { scrollToBooking: true },
    });
  };

  // Manual navigation for carousel
  const goToNextBackground = () => {
    setCurrentBackgroundIndex((prevIndex) =>
      prevIndex === heroBackgrounds.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const goToPrevBackground = () => {
    setCurrentBackgroundIndex((prevIndex) =>
      prevIndex === 0 ? heroBackgrounds.length - 1 : prevIndex - 1,
    );
  };

  return (
    <Layout>
      <div className="min-h-screen gaming-theme">
        {/* Hero Banner with Carousel */}
        <section className="relative products-hero-section overflow-hidden">
          {/* Background Images Carousel */}
          <div className="absolute inset-0">
            {heroBackgrounds.map((bg, index) => (
              <div
                key={bg.id}
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out
                  ${index === currentBackgroundIndex ? "opacity-100" : "opacity-0"}`}
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${bg.url})`,
                  backgroundAttachment: "fixed",
                }}
              />
            ))}
          </div>

          {/* Carousel Navigation Arrows */}
          <button
            onClick={goToPrevBackground}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200"
            aria-label="Previous background"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNextBackground}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200"
            aria-label="Next background"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {heroBackgrounds.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBackgroundIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 
                  ${
                    index === currentBackgroundIndex
                      ? "w-8 bg-primary"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Hero Content (stays static) */}
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Explore{" "}
                <span className="bg-linear-to-r from-primary to-[#00D4FF] bg-clip-text text-transparent">
                  Gaming Gear
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Discover the latest gaming products at Kenya's premier gaming
                store. Expert advice, demo units, and price matching available.
              </p>

              {/* Quick Categories */}
              <div className="hidden md:flex flex-wrap justify-center gap-3">
                {productCategories
                  .filter((cat) => cat.featured)
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          category:
                            prev.category === category.id ? null : category.id,
                        }))
                      }
                      className={`px-4 py-2 rounded-sm flex items-center gap-2 transition ${
                        activeFilters.category === category.id
                          ? "bg-primary text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Store Promo */}
        <div className="bg-linear-to-r from-primary to-[#00D4FF] text-white py-3">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <Gift size={18} />
                <span className="font-semibold">STORE EXCLUSIVE:</span>
              </div>
              <span>
                Free setup consultation with any purchase • Price match
                guarantee • Demo units available
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-0">
            <div className="">
              {/* Products Grid */}
              <div className="w-full">
                {/* Mobile Filter Button */}
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-sm hover:bg-gray-700 transition"
                  >
                    <Filter size={18} />
                    Filters
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-sm ${viewMode === "grid" ? "bg-primary text-white" : "bg-gray-800 text-gray-400"}`}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-sm ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-800 text-gray-400"}`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
                <ProductGrid
                  filters={activeFilters}
                  searchQuery={searchQuery}
                  viewMode={viewMode}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Store Locations */}
        <section className="py-12 bg-dark-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Visit Our Stores</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Experience products in person with our expert staff
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Nairobi Store */}
              <div className="bg-dark rounded-sm border border-gray-800 p-6 hover:border-primary transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Nairobi Flagship Store
                    </h3>
                    <p className="text-gray-400 text-sm">Main Store</p>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-gray-300">
                    Tom Mboya Street, Near National Archives
                  </p>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="font-medium">Hours:</span>
                    <span>8:00 AM - 9:00 PM (Mon-Sat)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="font-medium">Phone:</span>
                    <a
                      href="tel:+254700000000"
                      className="text-primary hover:text-[#00D4FF]"
                    >
                      +254 708 728 793
                    </a>
                  </div>
                </div>
                <button className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-sm font-medium transition">
                  Get Directions
                </button>
              </div>

              {/* Services Card */}
              <div className="bg-dark rounded-sm border border-gray-800 p-6 hover:border-secondary transition">
                <h3 className="text-xl font-bold text-white mb-4">
                  Store Services
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    "Free Setup Consultation",
                    "Product Demos & Testing",
                    "Price Match Guarantee",
                    "Warranty Registration",
                    "Gaming Setup Services",
                    "Community Events",
                  ].map((service, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00FF88] rounded-full"></div>
                      <span className="text-gray-300">{service}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full border border-secondary text-secondary hover:bg-secondary/10 py-3 rounded-sm font-medium transition"
                  onClick={handleNavigateSetup}
                >
                  Book Consultation
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Products;
