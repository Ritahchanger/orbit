import RootLayout from "../../../../layout/RootLayout";
import { Link } from "react-router-dom";
import {
  Store,
  BarChart3,
  Shield,
  Users,
  Globe,
  ChevronRight,
  Star,
  Package,
  CreditCard,
  Clock,
  ArrowRight,
  CheckCircle,
  Quote,
  Briefcase,
  ChevronLeft,
  PieChart as PieChartIcon,
  Home as HomeIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import PricingTiers from "../components/PricingTears";
import Integration from "../components/Integration";

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const stats = [
    { value: "500+", label: "Businesses", icon: Briefcase, suffix: "trusted" },
    { value: "2,000+", label: "Stores", icon: Store, suffix: "locations" },
    { value: "50,000+", label: "Users", icon: Users, suffix: "active" },
    { value: "99.9%", label: "Uptime", icon: Clock, suffix: "SLA" },
  ];

  const features = [
    {
      icon: Globe,
      title: "Multi-Business Management",
      description:
        "Manage multiple businesses from a single dashboard with separate analytics, inventory, and teams.",
      benefits: [
        "Separate dashboards per business",
        "Cross-business reporting",
        "Centralized control",
      ],
      color: "blue",
    },
    {
      icon: Store,
      title: "Multi-Store Operations",
      description:
        "Control all your store locations in real-time with centralized management and local autonomy.",
      benefits: [
        "Real-time inventory sync",
        "Store-specific pricing",
        "Location-based analytics",
      ],
      color: "indigo",
    },
    {
      icon: Package,
      title: "Smart Inventory Control",
      description:
        "AI-powered inventory management with automatic reordering and stock optimization.",
      benefits: [
        "Low stock alerts",
        "Predictive ordering",
        "Multi-warehouse support",
      ],
      color: "purple",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Comprehensive business intelligence with custom reports and predictive insights.",
      benefits: [
        "Real-time dashboards",
        "Custom report builder",
        "Trend forecasting",
      ],
      color: "cyan",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description:
        "Granular permission controls with 4-tier role hierarchy for secure operations.",
      benefits: ["4 role levels", "Custom permissions", "Audit logging"],
      color: "green",
    },
    {
      icon: CreditCard,
      title: "Integrated Payments",
      description:
        "Seamless payment processing with M-Pesa and multiple gateway support.",
      benefits: ["M-Pesa integration", "Multi-currency", "Auto-reconciliation"],
      color: "orange",
    },
  ];

  const solutions = [
    {
      title: "Retail Chains",
      description: "Perfect for businesses with multiple retail locations",
      image: "🏪",
      features: [
        "Multi-store inventory",
        "Centralized pricing",
        "Staff management",
      ],
    },
    {
      title: "Restaurants",
      description: "Complete solution for restaurant chains and franchises",
      image: "🍽️",
      features: ["Table management", "Kitchen display", "Online ordering"],
    },
    {
      title: "E-commerce",
      description: "Integrate online and offline sales channels",
      image: "🛍️",
      features: [
        "Website integration",
        "Order management",
        "Customer profiles",
      ],
    },
    {
      title: "Wholesale",
      description: "B2B features for wholesale distributors",
      image: "📦",
      features: ["Bulk pricing", "Order history", "Credit management"],
    },
  ];

  const testimonials = [
    {
      quote:
        "Orbit transformed how we manage our 15 stores across East Africa. We've seen a 40% reduction in inventory costs and real-time visibility across all locations.",
      author: "James Mwangi",
      position: "CEO, Retail Solutions Ltd",
      avatar: "👨‍💼",
      rating: 5,
    },
    {
      quote:
        "The multi-business feature is a game-changer. We run three different brands, and Orbit handles each one separately while giving us consolidated reporting.",
      author: "Sarah Kimani",
      position: "Operations Director, Food Chain Kenya",
      avatar: "👩‍💼",
      rating: 5,
    },
    {
      quote:
        "Implementation was smooth, and the support team is exceptional. Our staff adapted quickly thanks to the intuitive interface.",
      author: "David Ochieng",
      position: "IT Manager, Mega Stores",
      avatar: "👨‍💻",
      rating: 5,
    },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "KES 5,000",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "Up to 2 stores",
        "Basic analytics",
        "Inventory management",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "KES 15,000",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Up to 10 stores",
        "Advanced analytics",
        "Multi-business support",
        "Priority support",
        "API access",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited stores",
        "Custom analytics",
        "Dedicated account manager",
        "SLA guarantee",
        "On-premise option",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // ✅ Use dataset.observe instead of id
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.dataset.observe]: true,
            }));
          }
        });
      },
      { threshold: 0.1 },
    );

    document
      .querySelectorAll("[data-observe]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <RootLayout>
      {/* Hero Section */}
      <HeroSection isVisible={isVisible} stats={stats} />

      {/* Stats Bar */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}{" "}
                  <span className="text-blue-600">{stat.suffix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}

      <Features features={features} isVisible={isVisible} />

      {/* Solutions Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Every{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Industry
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored solutions for different business types and industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-blue-600 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-bl-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>
                <div className="text-4xl mb-4">{solution.image}</div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-2">
                  {solution.title}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-white/90 mb-4">
                  {solution.description}
                </p>
                <ul className="space-y-1 mb-4">
                  {solution.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-gray-500 group-hover:text-white/80 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/solutions/${solution.title.toLowerCase().replace(" ", "-")}`}
                  className="text-blue-600 group-hover:text-white text-sm font-medium inline-flex items-center gap-1"
                >
                  Learn More
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Business Leaders
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              See what our clients say about their experience with Orbit
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${activeTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                      <Quote className="w-12 h-12 text-blue-300 mb-6 opacity-50" />
                      <p className="text-xl mb-6 leading-relaxed">
                        {testimonial.quote}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {testimonial.author}
                          </div>
                          <div className="text-sm text-blue-200">
                            {testimonial.position}
                          </div>
                        </div>
                        <div className="ml-auto flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setActiveTestimonial(Math.max(0, activeTestimonial - 1))
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setActiveTestimonial(
                  Math.min(testimonials.length - 1, activeTestimonial + 1),
                )
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeTestimonial === index ? "w-8 bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <Integration />

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Transparent Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your business needs. All plans include a
              14-day free trial.
            </p>
          </div>

          {/* pricing */}
          <PricingTiers />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses already using Orbit to streamline their
            operations and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
              Contact Sales
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </section>
    </RootLayout>
  );
};

export default Home;
