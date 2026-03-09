import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Trophy,
  Calendar,
  MessageSquare,
  MapPin,
  TrendingUp,
  Award,
  Star,
  Camera,
  Gamepad2,
  Gift,
  ChevronRight,
  Share2,
  ThumbsUp,
  Clock,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Search,
  Filter,
} from "lucide-react";
import {
  nairobiGamingEvents,
  kenyanGamers,
  localGamingCommunities,
  communityStats,
} from "../data";
import Layout from "../../../layout/everyone-layout/Layout";

const Community = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = nairobiGamingEvents.filter((event) => {
    if (activeFilter === "all") return true;
    return event.status === activeFilter;
  });

  const filteredGamers = kenyanGamers.filter(
    (gamer) =>
      gamer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gamer.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Layout>
      <div className="min-h-screen gaming-theme">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-dark to-dark-light hero-section-community">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/10 rounded-sm border border-primary/20">
                <Users className="text-primary" size={20} />
                <span className="text-primary font-semibold">
                  KENYA'S LARGEST GAMING COMMUNITY
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Connect with{" "}
                <span className="bg-gradient-to-r from-primary to-[#00D4FF] bg-clip-text text-transparent">
                  Nairobi Gamers
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of Kenyan gamers in tournaments, workshops, and
                online communities. From casual players to esports pros -
                there's a place for everyone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* <Link
                  to="/events"
                  className="rounded-sm border-2 border-secondary bg-secondary/5 px-8 py-2 text-lg font-bold text-white transition-all hover:bg-secondary/10 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Calendar size={20} /> View Events
                </Link> */}
              </div>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-12 bg-dark-light">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {communityStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-dark rounded-sm border border-gray-800 hover:border-primary transition"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Kenyan Gaming Events
                </h2>
                <p className="text-gray-400">
                  Tournaments, meetups, and workshops across Nairobi
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "upcoming", "past"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-sm text-sm font-medium capitalize transition ${
                      activeFilter === filter
                        ? "bg-primary text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-dark-light rounded-sm border border-gray-800 overflow-hidden hover:border-primary transition"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-sm text-xs font-semibold ${
                              event.type === "Tournament"
                                ? "bg-secondary/20 text-secondary"
                                : event.type === "Workshop"
                                  ? "bg-[#00FF88]/20 text-[#00FF88]"
                                  : "bg-primary/20 text-primary"
                            }`}
                          >
                            {event.type}
                          </span>
                          <span className="px-3 py-1 rounded-sm bg-gray-800 text-gray-300 text-xs">
                            {event.game}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {event.title}
                        </h3>
                      </div>
                      {event.featured && (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-sm">
                          🔥 FEATURED
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 mb-4">{event.description}</p>

                    <div className="space-y-3 mb-6">
                      {/* <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        <span>
                          {event.date} • {event.time}
                        </span>
                      </div> */}
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users size={16} />
                          <span>{event.participants} participants</span>
                        </div>
                        <div className="text-secondary font-semibold">
                          {event.prize}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div
                        className={`flex-1 bg-gray-400 cursor-not-allowed text-sm text-white py-2 rounded-sm text-center font-medium`}
                      >
                        Registration closed
                      </div>
                      <button
                        disabled
                        className="px-4 py-2 text-sm border border-gray-700 text-gray-500 bg-gray-800/50 rounded-sm cursor-not-allowed flex items-center gap-2 opacity-60"
                      >
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kenyan Gamers */}
        <section className="py-16 bg-dark-light">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Top Kenyan Gamers</h2>
                <p className="text-gray-400">
                  Connect with Kenya's gaming elite
                </p>
              </div>

              <div className="relative w-full md:w-64">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search gamers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGamers.map((gamer) => (
                <div
                  key={gamer.id}
                  className="bg-dark rounded-sm border border-gray-800 p-6 hover:border-primary transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#00D4FF] rounded-sm flex items-center justify-center text-white font-bold text-xl">
                          {gamer.avatar}
                        </div>
                        {gamer.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF88] rounded-full border-2 border-dark"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{gamer.name}</h3>
                        <p className="text-sm text-gray-400">{gamer.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={14} className="text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {gamer.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-sm">
                      <Trophy size={14} className="text-yellow-400" />
                      <span className="text-sm font-bold text-white">
                        #{gamer.rank}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {gamer.game}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {gamer.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award size={14} className="text-secondary" />
                          <span className="text-xs text-gray-400">
                            {achievement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-700 text-gray-500 bg-gray-800/50 rounded-sm cursor-not-allowed flex items-center gap-2 opacity-60">
                      Message
                    </button>
                    <button className="px-4 py-2 text-sm border border-gray-700 text-gray-500 bg-gray-800/50 rounded-sm cursor-not-allowed flex items-center gap-2 opacity-60">
                      <ThumbsUp size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Local Communities */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Kenyan Gaming Communities
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Join specialized communities based in Nairobi and across Kenya
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {localGamingCommunities.map((community) => (
                <Link
                  key={community.id}
                  to="#"
                  className="bg-dark-light rounded-sm border border-gray-800 p-6 hover:border-primary transition group"
                >
                  <div className="text-4xl mb-4">{community.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition">
                    {community.name}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {community.members} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {community.platform}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                    <span className="text-sm text-primary">Join Community</span>
                    <ChevronRight
                      size={16}
                      className="text-primary transition"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 via-dark-light to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Level Up in Kenya's Gaming Scene?
              </h2>
              <p className="text-gray-300 mb-8">
                Whether you're in Nairobi, Mombasa, Kisumu, or anywhere in Kenya
                - connect with local gamers, join tournaments, and grow with the
                community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* <Link
                                    to="/community/join"
                                    className="rounded-sm bg-linear-to-r from-primary to-[#00D4FF] px-8 py-4 text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-glow-blue flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={20} /> Join Discord Server
                                </Link> */}
                <Link
                  to="/products"
                  className="rounded-sm border-2 border-white/30 bg-white/5 px-8 py-2 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <MapPin size={20} /> Visit Our Nairobi Store
                </Link>
              </div>

              {/* Social Links */}
              <div className="flex justify-center gap-4 mt-8">
                {[Instagram, Facebook, Twitter, Youtube].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-12 h-12 bg-gray-800 hover:bg-primary rounded-sm flex items-center justify-center text-white transition"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Community;
