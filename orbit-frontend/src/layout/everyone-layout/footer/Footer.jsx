import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gamepad2,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Shield,
  Truck,
  CreditCard,
  Facebook,
  Twitter,
  Instagram,
  Twitch,
  Youtube,
  MessageCircle,
  ChevronUp,
  Store,
  Clock,
  Users,
} from "lucide-react";
import { IoLogoTiktok } from "react-icons/io5";
import "./footer.css";
import { footerLinks } from "./data";
import { toast } from "react-hot-toast";
import { newsletterService } from "../../../everyone-pages/services/newletter-service";
import { useAuth } from "../../../context/authentication/AuthenticationContext";
import SocialMedia from "./components/SocialMedia";
import ShopLinks from "./components/ShopLinks";
import SupportLinks from "./components/SupportLinks";
import NewsletterSubscription from "./components/NewsletterSubscription";

const Footer = () => {
  const { user, isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    shop: false,
    support: false,
    contact: false,
  });

  // Check if user is already subscribed to newsletter
  useEffect(() => {
    if (isAuthenticated && user?.newsletter) {
      setShowNewsletter(false);
      setSubscribed(true);
    } else {
      setShowNewsletter(true);
    }
  }, [user, isAuthenticated]);

  const paymentMethods = ["M-Pesa", "PayPal", "Visa", "Mastercard"];

  const socialMedia = [
    {
      icon: <Facebook size={20} />,
      name: "Facebook",
      link: "https://www.facebook.com/sally.francis.196468?rdid=9ipXuKX5NbrSecg7#",
    },
    {
      icon: <IoLogoTiktok size={20} />,
      name: "TikTok",
      link: "https://www.tiktok.com/@megagamers254?_r=1&_t=ZS-946WEdg2u8L",
    },
    {
      icon: <Instagram size={20} />,
      name: "Instagram",
      link: "https://www.instagram.com/megagamers254?igsh=cGpuM2pyeDJjYWJy",
    },
    {
      icon: <Youtube size={20} />,
      name: "YouTube",
      link: "https://youtube.com/@megagamers254?si=0nXC6onbfTY9CdSU",
    },
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await newsletterService.subscribe({ email });

      if (result.success) {
        toast.success(
          result.message || "Successfully subscribed to our newsletter!",
        );
        setSubscribed(true);
        setShowNewsletter(false);
        setEmail("");

        if (!isAuthenticated) {
          setTimeout(() => {
            setSubscribed(false);
            setShowNewsletter(true);
          }, 5000);
        }
      } else {
        toast.error(result.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-dark-light mt-auto pb-16 md:pb-0">
      {/* NEW: Store Location Banner - Added at the top of footer */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-y border-gray-800 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm font-medium flex flex-col md:flex-row items-center justify-center gap-2 text-white">
            <MapPin size={16} className="text-primary" />
            <span>
              VISIT OUR STORE: Tom Mboya Street (Behind National Archives,
              Simara Mall 3rd Floor Shop 61)
            </span>
            <span className="text-primary font-bold ml-2">
              🎮 FREE SETUP CONSULTATION FOR ALL VISITORS!
            </span>
          </p>
        </div>
      </div>

      {/* Quick Actions Bar - Mobile First */}
      <div className="sticky bottom-16 md:hidden bg-dark border-t border-gray-800 z-30">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={scrollToTop}
            className="flex flex-col items-center text-gray-400"
          >
            <ChevronUp size={20} />
            <span className="text-[10px] mt-1 ">Top</span>
          </button>
          <Link
            to="/products"
            className="flex flex-col items-center text-gray-400"
          >
            <Store size={20} />
            <span className="text-[10px] mt-1">Store</span>
          </Link>
          <Link
            to="/admin/dashboard"
            className="flex flex-col items-center text-gray-400"
          >
            <Users size={20} />
            <span className="text-[10px] mt-1">Officials</span>
          </Link>
        </div>
      </div>

      {/* Trust Badges - Horizontal Scroll on Mobile */}
      <div className="border-b border-gray-800 overflow-x-auto hide-scrollbar">
        <div className="flex md:grid md:grid-cols-3 gap-4 p-4 md:container md:mx-auto md:px-4 md:py-6 min-w-max md:min-w-0">
          <div className="flex items-center space-x-3 flex-shrink-0 w-48 md:w-auto">
            <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
              <Truck className="text-primary" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-white">Free Shipping</h4>
              <p className="text-xs text-gray-400">Around nairobi</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0 w-48 md:w-auto">
            <div className="w-10 h-10 bg-green-500/10 rounded-sm flex items-center justify-center">
              <Shield className="text-[#00FF88]" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-white ">Warranty</h4>
              <p className="text-xs text-gray-400">On all products</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0 w-48 md:w-auto">
            <div className="w-10 h-10 bg-secondary/10 rounded-sm flex items-center justify-center">
              <CreditCard className="text-secondary" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-white">Secure Payment</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content - Mobile Accordion Style */}
      <div className="container mx-auto px-4 py-6">
        {/* Brand Section - Always Visible */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">
            Professional-grade gaming equipment for competitive gamers and
            enthusiasts.
          </p>

          {/* Newsletter - Mobile Optimized */}
          <div className="mb-6">
            <NewsletterSubscription
              showNewsletter={showNewsletter}
              handleSubscribe={handleSubscribe}
              email={email}
              setEmail={setEmail}
              isAuthenticated={isAuthenticated}
              loading={loading}
              subscribed={subscribed}
              user={user}
            />
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-2">
          {/* Shop Section */}
          <div className="border border-gray-800 rounded-sm overflow-hidden">
            <button
              onClick={() => toggleSection("shop")}
              className="w-full flex items-center justify-between p-4 bg-gray-900/50"
            >
              <span className="text-white font-semibold">Shop</span>
              <ChevronUp
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${
                  expandedSections.shop ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.shop && (
              <div className="p-4 bg-gray-900/20">
                <ShopLinks footerLinks={footerLinks} />
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="border border-gray-800 rounded-sm overflow-hidden">
            <button
              onClick={() => toggleSection("support")}
              className="w-full flex items-center justify-between p-4 bg-gray-900/50"
            >
              <span className="text-white font-semibold">Support</span>
              <ChevronUp
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${
                  expandedSections.support ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.support && (
              <div className="p-4 bg-gray-900/20">
                <SupportLinks footerLinks={footerLinks} />
              </div>
            )}
          </div>

          {/* Contact & Store Section - UPDATED with both locations */}
          <div className="border border-gray-800 rounded-sm overflow-hidden">
            <button
              onClick={() => toggleSection("contact")}
              className="w-full flex items-center justify-between p-4 bg-gray-900/50"
            >
              <span className="text-white font-semibold">Contact & Store</span>
              <ChevronUp
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${
                  expandedSections.contact ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.contact && (
              <div className="p-4 bg-gray-900/20 space-y-6">
                {/* Main Store Location */}
                <div>
                  <h5 className="text-primary font-semibold text-sm mb-2 flex items-center gap-2">
                    <Store size={16} /> MAIN STORE
                  </h5>
                  <div className="flex items-start space-x-3">
                    <MapPin className="text-primary mt-1 shrink-0" size={18} />
                    <div>
                      <p className="text-white font-medium text-sm">
                        Simara Mall:
                      </p>
                      <p className="text-gray-400 text-xs">
                        Tom Mboya Street (Behind National Archives)
                        <br />
                        Simara Mall, 3rd Floor, Shop 61
                        <br />
                        Nairobi, Kenya
                      </p>
                    </div>
                  </div>
                </div>

                {/* Second Store Location - NEW */}
                <div className="border-t border-gray-800 pt-4">
                  <h5 className="text-secondary font-semibold text-sm mb-2 flex items-center gap-2">
                    <Store size={16} /> SECOND STORE
                  </h5>
                  <div className="flex items-start space-x-3">
                    <MapPin
                      className="text-secondary mt-1 shrink-0"
                      size={18}
                    />
                    <div>
                      <p className="text-white font-medium text-sm">
                        Rural Urban Building:
                      </p>
                      <p className="text-gray-400 text-xs">
                        Behind National Archives, Tom Mboya Street
                        <br />
                        Rural Urban (Building), Basement Shop G16
                        <br />
                        Nairobi, Kenya
                      </p>
                      <p className="text-xs text-primary mt-2 font-medium">
                        🎮 FREE SETUP CONSULTATION AT BOTH LOCATIONS!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Phone className="text-primary shrink-0" size={18} />
                    <div>
                      <p className="text-white font-medium text-sm">
                        Customer Service:
                      </p>
                      <p className="text-gray-400 text-xs">
                        +254 708 728 793 | +254 707 992 593
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <Mail className="text-primary shrink-0" size={18} />
                    <div>
                      <p className="text-white font-medium text-sm">Email:</p>
                      <p className="text-gray-400 text-xs">
                        support@megagamers.co.ke
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="text-primary shrink-0" size={18} />
                    <div>
                      <p className="text-white font-medium text-sm">
                        Support Hours:
                      </p>
                      <p className="text-gray-400 text-xs">Mon-Sat: 8AM-8PM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Media - Always Visible */}
        <div className="mt-6">
          <SocialMedia socialMedia={socialMedia} />
        </div>
      </div>

      {/* Bottom Bar - Mobile Optimized */}
      <div className="border-t border-gray-800 bg-gray-900/30">
        <div className="container mx-auto px-4 py-4">
          {/* Payment Methods - Horizontal Scroll */}
          <div className="overflow-x-auto hide-scrollbar mb-4">
            <div className="flex space-x-2 min-w-max">
              {paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-gray-800 rounded-sm text-gray-300 text-xs"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

          {/* Copyright & Legal - Stacked on Mobile */}
          <div className="space-y-3">
            <div className="text-gray-500 text-xs text-center">
              © {currentYear} Mega Gamers Ltd. All rights reserved.
            </div>

            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <Link
                to="/privacy"
                className="text-gray-500 hover:text-white transition"
              >
                Privacy
              </Link>
              <span className="text-gray-700">•</span>
              <Link
                to="/terms"
                className="text-gray-500 hover:text-white transition"
              >
                Terms
              </Link>
              <span className="text-gray-700">•</span>
              <Link
                to="/cookies"
                className="text-gray-500 hover:text-white transition"
              >
                Cookies
              </Link>
              <span className="text-gray-700">•</span>
              <Link
                to="/returns"
                className="text-gray-500 hover:text-white transition"
              >
                Returns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
