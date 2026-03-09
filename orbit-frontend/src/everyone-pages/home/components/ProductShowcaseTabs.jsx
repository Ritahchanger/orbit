import { Monitor, Trophy, Check, Gamepad2 } from "lucide-react"

import { useNavigate } from "react-router-dom"

import TabContent from './TabContent'

const ProductShowcaseTabs = ({ activeTab, storeBenefits, setActiveTab }) => {

    const navigate = useNavigate();

    const handleNavigateSetup = () => {
        navigate("/setup-consultation", {
            state: { scrollToBooking: true }
        });
    }

    return (
        <section>
            <div className="text-center mb-12">
                <span className="text-secondary font-semibold">EXPLORE OUR COLLECTION</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">Premium Gaming Products</h2>
                <p className="text-[#B0B0B0] mt-4 max-w-2xl mx-auto">
                    Visit our store to experience these products firsthand with expert guidance
                </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-sm bg-[#252525] p-1">
                    {['products', 'setup', 'experience'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-sm text-sm md:text-lg font-medium transition  ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab === 'products' && 'Featured Products'}
                            {tab === 'setup' && 'Complete Setups'}
                            {tab === 'experience' && 'Store Experience'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'products' && (
                <TabContent />
            )}

            {activeTab === 'setup' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Streamer Pro Setup', price: 'From $2,499', icon: <Monitor size={32} />, items: ['4K Webcam', 'Studio Mic', 'Stream Deck', 'RGB Lighting'] },
                        { name: 'Competitive Esports', price: 'From $1,899', icon: <Trophy size={32} />, items: ['240Hz Monitor', 'Mechanical Keyboard', 'Pro Gaming Mouse', 'Noise-Cancelling'] },
                        { name: 'Premium Casual', price: 'From $999', icon: <Gamepad2 size={32} />, items: ['Gaming Console', 'Surround Sound', 'Comfort Chair', '4K Display'] }
                    ].map((setup, index) => (
                        <div key={index} className="bg-[#1E1E1E] rounded-sm p-8 border border-gray-800 hover:border-primary transition">
                            <div className="text-primary mb-6">
                                {setup.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{setup.name}</h3>
                            <p className="text-secondary font-bold mb-4">{setup.price}</p>
                            <ul className="space-y-2 mb-6">
                                {setup.items.map((item, idx) => (
                                    <li key={idx} className="flex items-center text-gray-400 text-sm">
                                        <Check size={16} className="text-primary mr-2" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => { handleNavigateSetup() }}
                                className="w-full bg-primary/20 hover:bg-primary/30 text-primary py-3 rounded-sm font-medium transition"
                            >
                                BOOK SETUP CONSULTATION
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'experience' && (
                <div className="bg-[#1E1E1E] rounded-sm p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {storeBenefits.map((benefit, index) => (
                            <div key={index} className="text-center p-6 hover:bg-[#252525] rounded-sm transition">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                    {benefit.icon}
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                                <p className="text-sm text-gray-400">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default ProductShowcaseTabs