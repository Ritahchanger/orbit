import { Link } from "react-router-dom";
import { Zap, ArrowRight, Play, Shield, Clock } from "lucide-react";

const HeroSection = ({ isVisible, stats }) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden pb-32">
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            data-observe="hero-content"
            className={`transition-all duration-1000 transform ${
              isVisible?.["hero-content"] !== false
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {/* Trust badge */}
            {/* <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 mb-6 border border-white/30 shadow-lg">
              <Zap className="w-5 h-5 mr-2 text-yellow-300" />
              <span className="text-sm font-bold text-white tracking-wide">
                TRUSTED BY 500+ BUSINESSES IN AFRICA
              </span>
            </div> */}

            {/* Main heading */}
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
              The Ultimate{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-200 to-pink-200">
                Multi-Business
              </span>
              <br />
              <span className="text-white">Management Platform</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-100 mb-8 max-w-2xl leading-relaxed font-medium drop-shadow-lg">
              Streamline operations across all your businesses and stores with
              real-time insights, powerful automation, and enterprise-grade
              security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/demo"
                className="group bg-white text-blue-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-2xl transform hover:-translate-y-1 border-2 border-transparent"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="group bg-blue-600/40 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600/60 transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-xl"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {stats.slice(0, 3).map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <div className="text-3xl font-extrabold text-white">
                    {stat.value}
                  </div>
                  <div className="text-base text-blue-200 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center gap-4 text-sm text-gray-200">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>

          <div
            data-observe="hero-image"
            className={`relative transition-all duration-1000 delay-300 transform ${
              isVisible?.["hero-image"] !== false
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-400 rounded-full blur-2xl opacity-60"></div>
              <img
                src="/api/placeholder/600/400"
                alt="Orbit Dashboard Preview"
                className="rounded-xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-gray-200">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <span className="text-xs text-gray-500">
                    Live Transactions
                  </span>
                  <p className="text-sm font-bold">2,847 today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      {/* <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="fill-white w-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path d="M0,120 L1440,120 L1440,0 C1380,40 1320,60 1260,60 C1140,60 1080,20 960,20 C840,20 780,60 660,60 C540,60 480,20 360,20 C240,20 180,60 60,60 C0,60 0,40 0,40 Z"></path>
        </svg>
      </div> */}
    </section>
  );
};

export default HeroSection;
