import React from "react";
import { Link } from "react-router-dom";
import {
  Rocket,
  Heart,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  Globe,
  Shield,
  Award,
  Clock,
  Instagram,
  Youtube,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", path: "/features" },
        { name: "Pricing", path: "/pricing" },
        { name: "Integrations", path: "/integrations" },
        { name: "API", path: "/api-docs" },
        { name: "Changelog", path: "/changelog" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { name: "Multi-Business", path: "/solutions/multi-business" },
        { name: "Multi-Store", path: "/solutions/multi-store" },
        { name: "Inventory", path: "/solutions/inventory" },
        { name: "Analytics", path: "/solutions/analytics" },
        { name: "Mobile POS", path: "/solutions/mobile-pos" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", path: "/docs" },
        { name: "Blog", path: "/blog" },
        { name: "Case Studies", path: "/case-studies" },
        { name: "Webinars", path: "/webinars" },
        { name: "Support", path: "/support" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Press", path: "/press" },
        { name: "Partners", path: "/partners" },
        { name: "Contact", path: "/contact" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/orbit", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/orbit", label: "Twitter" },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/orbit",
      label: "LinkedIn",
    },
    {
      icon: Instagram,
      href: "https://instagram.com/orbit",
      label: "Instagram",
    },
    { icon: Github, href: "https://github.com/orbit", label: "GitHub" },
    { icon: Youtube, href: "https://youtube.com/orbit", label: "YouTube" },
  ];

  const trustBadges = [
    { icon: Shield, text: "Enterprise Security" },
    { icon: Award, text: "ISO 27001 Certified" },
    { icon: Clock, text: "99.9% Uptime SLA" },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Newsletter Section */}
        <div className="mb-16 p-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                Stay in the Orbit
              </h3>
              <p className="text-blue-100 text-lg max-w-2xl">
                Get the latest updates, features, and insights delivered to your
                inbox
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  />
                </div>
                <button className="px-6 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 group whitespace-nowrap">
                  Subscribe
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <p className="text-blue-200 text-sm mt-2 text-center sm:text-left">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 group mb-6">
              <div className="p-2 bg-blue-500 rounded-xl group-hover:bg-blue-400 transition-colors">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl">Orbit</span>
            </Link>

            <p className="text-gray-300 mb-6 text-lg leading-relaxed">
              The ultimate multi-business management platform. Streamline
              operations across all your stores with real-time insights and
              powerful automation.
            </p>

            {/* Trust Badges */}
            <div className="space-y-3 mb-6">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-gray-300"
                >
                  <badge.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>123 Tech Hub, Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>+254 (0) 700 000 000</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>hello@orbit.com</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-lg mb-4 text-white">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-0 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-200 text-blue-400" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center lg:text-left">
              © {currentYear} Orbit. All rights reserved.
              <span className="mx-2">|</span>
              Made with{" "}
              <Heart className="w-4 h-4 inline-block text-red-500 mx-1" /> in
              Kenya
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors duration-200 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-600">•</span>
              <Link
                to="/cookies"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group z-50"
        aria-label="Back to top"
      >
        <ArrowRight className="w-5 h-5 rotate-[-90deg] group-hover:translate-y-[-2px] transition-transform" />
      </button>
    </footer>
  );
};

export default Footer;
