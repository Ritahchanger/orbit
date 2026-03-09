import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
    Gamepad2, Shield, Trophy,
    MapPin, Clock, Users, Star, Award,
    Package, Gift
} from 'lucide-react'

import Layout from '../../../layout/everyone-layout/Layout'
import VideoModal from '../components/VideoModal'
import HeroSection from '../components/HeroSection'
import CompanyStats from '../components/CompanyStats'
import ProductShowcaseTabs from '../components/ProductShowcaseTabs'

const Home = () => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
    const [isLeadFormOpen, setIsLeadFormOpen] = useState(false)
    const [formSubmitted, setFormSubmitted] = useState(false)
    const [activeTab, setActiveTab] = useState('products')

    // Scroll to footer newsletter function
    const scrollToNewsletter = () => {
        const footer = document.getElementById('footer');
        if (footer) {
            // Smooth scroll to footer
            footer.scrollIntoView({ behavior: 'smooth' });

            // Find newsletter section within footer (update if your newsletter has specific ID)
            setTimeout(() => {
                // Add highlight animation
                const newsletterSection = footer.querySelector('form, .newsletter-container');
                if (newsletterSection) {
                    newsletterSection.classList.add('highlight-newsletter');

                    // Remove highlight after animation
                    setTimeout(() => {
                        newsletterSection.classList.remove('highlight-newsletter');
                    }, 3000);
                }
            }, 500);
        }
    }


    // Stats for advertising
    const companyStats = [
        { value: '10,000+', label: 'Happy Gamers', icon: <Users size={20} /> },
        { value: '8+', label: 'Years Experience', icon: <Award size={20} /> },
        { value: '98%', label: 'Satisfaction Rate', icon: <Star size={20} /> },
        { value: '2-Hour', label: 'Setup Support', icon: <Clock size={20} /> }
    ]

    // Store benefits
    const storeBenefits = [
        { icon: <Shield size={24} />, title: 'Expert Advice', desc: 'Get personalized setup recommendations from gaming experts' },
        { icon: <Gift size={24} />, title: 'Free Setup Demo', desc: 'Try before you buy with our in-store demo stations' },
        { icon: <Trophy size={24} />, title: 'Pro Gamer Events', desc: 'Exclusive tournaments and meetups at our store' },
        { icon: <Package size={24} />, title: 'Same-Day Pickup', desc: 'Reserve online, pick up in-store within hours' }
    ]

    // Testimonials
    const testimonials = [
        { name: 'Dennis "Munyao" Kim', role: 'Esports Champion', text: 'Mega Gamers helped build my championship-winning setup. Their expertise is unmatched!', rating: 5 },
        { name: 'Anne Mutua', role: 'Streamer', text: 'The best gaming store in Nairobi! Their advice transformed my streaming setup.', rating: 5 },
        { name: 'David Omondi', role: 'Competitive Gamer', text: 'From casual to competitive - they have everything you need. Professional service!', rating: 5 }
    ]

    return (
        <Layout>
            <div className="space-y-20 pb-16">
                {/* Video Modal */}
                {isVideoModalOpen && (
                    <VideoModal setIsVideoModalOpen={setIsVideoModalOpen} />
                )}

                {/* Hero Section - Advertising Focus */}
                <HeroSection setIsLeadFormOpen={setIsLeadFormOpen} setIsVideoModalOpen={setIsVideoModalOpen} companyStats={companyStats} />

                {/* Company Stats */}
                <CompanyStats companyStats={companyStats} />

                {/* Product Showcase Tabs */}
                <ProductShowcaseTabs activeTab={activeTab} storeBenefits={storeBenefits} setActiveTab={setActiveTab} />

                {/* Testimonials */}
                <section>
                    <div className="text-center mb-12">
                        <span className="text-secondary font-semibold">WHAT GAMERS SAY</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2">Trusted by Gaming Community</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-[#1E1E1E] rounded-sm p-8 border border-gray-800 hover:border-primary transition">
                                <div className="flex items-center mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="text-secondary fill-current" size={16} />
                                    ))}
                                </div>
                                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-linear-to-br from-primary to-[#00D4FF] rounded-full flex items-center justify-center text-white font-bold mr-4">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{testimonial.name}</p>
                                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative overflow-hidden rounded-sm bg-linear-to-r from-primary/20 via-[#00D4FF]/20 to-[#00FF88]/20 p-12 text-center border border-primary/30">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Level Up?</h2>
                        <p className="text-xl text-[#B0B0B0] mb-8 max-w-2xl mx-auto">
                            Join Nairobi's largest gaming community. Visit our store or join online for exclusive benefits.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={scrollToNewsletter}
                                className="rounded-sm bg-linear-to-r from-primary to-[#00D4FF] px-10 py-4 text-sm md:text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-glow-blue flex items-center justify-center gap-2"
                            >
                                <Gift size={20} /> JOIN FOR EXCLUSIVE DEALS
                            </button>
                            <Link
                                to="/products"
                                className="rounded-sm text-sm  border-2 border-white/30 bg-white/5 px-10 py-4 md:text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <MapPin size={20} /> VISIT OUR STORE
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            Already visited? <button onClick={() => setIsLeadFormOpen(true)} className="text-primary hover:underline">Join our loyalty program</button>
                        </p>
                    </div>
                    <div className="absolute top-4 left-4 opacity-10">
                        <Gamepad2 className="text-8xl" size={80} />
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-10">
                        <Trophy className="text-8xl" size={80} />
                    </div>
                </section>
            </div>
        </Layout>
    )
}

export default Home