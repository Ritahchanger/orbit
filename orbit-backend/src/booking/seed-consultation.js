// scripts/seedConsultationTypes.js
const mongoose = require('mongoose');

const ConsultationType = require('./consultation.model');

const connectDb = require("../config/db.connection")

require('dotenv').config();

const consultationTypes = [
    {
        id: 'beginner-gamer',
        title: 'Beginner Gamer Setup',
        description: 'Perfect for new gamers in Kenya. We\'ll help you choose the right entry-level equipment available locally and set up your first gaming station within your budget.',
        duration: '45 minutes',
        price: {
            amount: 0,
            currency: 'KES',
            display: 'FREE'
        },
        icon: '🎮',
        isActive: true,
        features: [
            'Basic gaming PC/laptop recommendations',
            'Essential peripherals guide (mouse, keyboard, headset)',
            'Budget planning for Kenyan market',
            'Where to buy in Nairobi/Mombasa/Kisumu',
            'Basic setup & optimization tips'
        ],
        order: 1
    },
    {
        id: 'mid-range-optimization',
        title: 'Mid-Range Performance Boost',
        description: 'Take your current setup to the next level. We\'ll analyze your existing gear and recommend upgrades for better gaming performance in competitive titles like Valorant, Fortnite, and FIFA.',
        duration: '60 minutes',
        price: {
            amount: 1500,
            currency: 'KES',
            display: 'KSh 1,500'
        },
        icon: '⚡',
        isActive: true,
        features: [
            'System performance analysis',
            'Component upgrade recommendations',
            'Game-specific optimization',
            'Cooling solutions for Kenyan climate',
            'Power supply considerations'
        ],
        order: 2
    },
    {
        id: 'esports-competitive',
        title: 'Esports & Competitive Setup',
        description: 'For serious gamers and aspiring esports athletes. We\'ll fine-tune every aspect of your setup for maximum competitive advantage in games like CS2, Dota 2, and PUBG.',
        duration: '75 minutes',
        price: {
            amount: 3000,
            currency: 'KES',
            display: 'KSh 3,000'
        },
        icon: '🏆',
        isActive: true,
        features: [
            '240Hz+ monitor recommendations',
            'Competitive peripherals selection',
            'Network optimization for gaming',
            'Ergonomic setup for long sessions',
            'Tournament-ready configuration'
        ],
        order: 3
    },
    {
        id: 'streaming-content',
        title: 'Streaming & Content Creation',
        description: 'Complete setup for Kenyan streamers and content creators. We\'ll handle everything from gaming PC to streaming setup, lighting, audio, and software configuration.',
        duration: '90 minutes',
        price: {
            amount: 5000,
            currency: 'KES',
            display: 'KSh 5,000'
        },
        icon: '🎥',
        isActive: true,
        features: [
            'Dual PC streaming setup',
            'Camera & lighting recommendations',
            'Audio setup (mic, interface, software)',
            'Streaming software configuration',
            'Content workflow optimization'
        ],
        order: 4
    },
    {
        id: 'premium-gaming',
        title: 'Premium Gaming Rig',
        description: 'For enthusiasts who want the best. We\'ll design a top-tier gaming system with the latest components available in Kenya, including RGB customization and premium peripherals.',
        duration: '90 minutes',
        price: {
            amount: 8000,
            currency: 'KES',
            display: 'KSh 8,000'
        },
        icon: '💎',
        isActive: true,
        features: [
            'High-end component selection',
            'Custom water cooling options',
            'Premium peripherals bundle',
            'Full RGB customization',
            'Warranty & support package'
        ],
        order: 5
    },
    {
        id: 'console-gaming',
        title: 'Console Gaming Setup',
        description: 'Optimize your PlayStation, Xbox, or Nintendo Switch experience. We\'ll help with monitor selection, audio setup, storage solutions, and accessory recommendations.',
        duration: '45 minutes',
        price: {
            amount: 1000,
            currency: 'KES',
            display: 'KSh 1,000'
        },
        icon: '🎯',
        isActive: true,
        features: [
            'Gaming monitor/TV recommendations',
            'Console-specific audio setup',
            'Storage expansion solutions',
            'Controller & accessory selection',
            'Network optimization for consoles'
        ],
        order: 6
    },
    {
        id: 'gaming-room',
        title: 'Gaming Room Design',
        description: 'Complete gaming room setup including furniture, lighting, acoustics, and decor. Transform your space into the ultimate gaming sanctuary.',
        duration: '120 minutes',
        price: {
            amount: 10000,
            currency: 'KES',
            display: 'KSh 10,000'
        },
        icon: '🏠',
        isActive: true,
        features: [
            'Room layout & furniture planning',
            'Acoustic treatment for gaming',
            'Ambient lighting setup',
            'Cable management solutions',
            'Gaming decor & accessories'
        ],
        order: 7
    },
    {
        id: 'vr-ar',
        title: 'VR & AR Gaming Setup',
        description: 'Specialized consultation for virtual reality and augmented reality gaming. We\'ll help you choose the right VR headset and set up your play space.',
        duration: '60 minutes',
        price: {
            amount: 4000,
            currency: 'KES',
            display: 'KSh 4,000'
        },
        icon: '👓',
        isActive: true,
        features: [
            'VR headset recommendations',
            'Play space setup & safety',
            'PC requirements for VR',
            'VR game & experience selection',
            'Motion sickness prevention tips'
        ],
        order: 8
    },
    {
        id: 'student-budget',
        title: 'Student Budget Gaming',
        description: 'Affordable gaming solutions for students in Kenyan universities and colleges. Maximize performance on a tight budget with locally available components.',
        duration: '45 minutes',
        price: {
            amount: 500,
            currency: 'KES',
            display: 'KSh 500'
        },
        icon: '🎓',
        isActive: true,
        features: [
            'Budget-friendly component selection',
            'Laptop vs desktop comparison',
            'Second-hand market guidance',
            'Campus gaming community tips',
            'Portable setup solutions'
        ],
        order: 9
    },
    {
        id: 'corporate-esports',
        title: 'Corporate Esports Setup',
        description: 'For companies looking to set up gaming lounges, esports teams, or gaming events. We provide enterprise-level solutions and support.',
        duration: '180 minutes',
        price: {
            amount: 25000,
            currency: 'KES',
            display: 'KSh 25,000'
        },
        icon: '🏢',
        isActive: true,
        features: [
            'Multiple station setup',
            'Network infrastructure planning',
            'Enterprise-grade equipment',
            'Maintenance & support package',
            'Event setup & management'
        ],
        order: 10
    }
];

async function seedConsultationTypes() {
    try {
        // Use the connectDb function instead of mongoose.connect
        await connectDb();
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await ConsultationType.deleteMany({});
        console.log('🗑️  Cleared existing consultation types');

        // Insert new data
        await ConsultationType.insertMany(consultationTypes);
        console.log(`✅ Seeded ${consultationTypes.length} consultation types successfully!`);

        // Display what was seeded
        const seededTypes = await ConsultationType.find({}).sort('order');
        console.log('\n📋 Seeded Consultation Types:');
        seededTypes.forEach(type => {
            console.log(`   ${type.order}. ${type.title} (${type.price.display})`);
        });

        // Close the connection
        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    seedConsultationTypes();
}

module.exports = { consultationTypes, seedConsultationTypes };