import { Play, Gift, MapPin, Award } from "lucide-react"
import { Link } from "react-router-dom"


const HeroSection = ({ setIsVideoModalOpen, companyStats }) => {
    return (
        <section className="relative overflow-hidden rounded-sm bg-gradient-to-r from-[#121212] via-[#1a1a2e] to-[#16213e] p-8 md:p-12 border border-gray-800
        
        home-hero-section

        ">
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block rounded-sm bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                        🏆 KENYA'S #1 GAMING STORE
                    </span>
                    <span className="inline-block rounded-sm bg-[#00FF88]/20 px-3 py-1 text-xs font-semibold text-[#00FF88]">
                        SINCE 2015
                    </span>
                </div>
                <h1 className="mb-4 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    YOUR ULTIMATE <span className="bg-gradient-to-r from-primary to-[#00D4FF] bg-clip-text text-transparent">GAMING</span> DESTINATION
                </h1>
                <p className="mb-8 text-xl text-[#B0B0B0]">
                    Discover Nairobi's premier gaming hub. Expert advice, professional setups,
                    and the latest gear - all at our flagship store on Tom Mboya Street.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">

                    <Link
                        to="/products"
                        className="rounded-sm border-2 border-secondary px-8 py-2 text-center font-bold text-secondary transition-all hover:bg-secondary/10 hover:shadow-glow-orange flex items-center justify-center gap-2 text-sm md:text-lg"
                    >
                        <MapPin size={20} /> VISIT OUR STORE
                    </Link>
                    <button
                        onClick={() => setIsVideoModalOpen(true)}
                        className="rounded-sm border-2 border-white/30 bg-white/5 px-8 py-2 text-center font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-lg"
                    >
                        <Play size={20} /> MEET OUR CEO
                    </button>
                </div>
            </div>
            {/* Stats Badge */}
            <div className="absolute right-8 top-8 hidden lg:block">
                <div className="bg-dark-light/80 backdrop-blur-sm rounded-sm border border-gray-700 p-6">
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#00D4FF] rounded-full flex items-center justify-center mx-auto mb-2">
                            <Award className="text-white" size={32} />
                        </div>
                        <p className="text-sm text-gray-400">Trusted by</p>
                        <p className="text-2xl font-bold text-white">10,000+ Gamers</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {companyStats.slice(0, 2).map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-lg font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection