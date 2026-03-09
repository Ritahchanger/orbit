import {
    Gamepad2, Monitor, Cpu, Headphones, Mouse, Keyboard,
    MapPin, Calendar, Clock, CheckCircle, Shield, Award,
    Users, Star, MessageSquare, Video, Phone, Mail,
    ChevronRight, Gift, Zap, Trophy
} from 'lucide-react'

export const setupTypes = [
    { id: 'beginner', name: 'Beginner Gaming Setup', price: 'FREE', icon: <Gamepad2 size={24} />, color: 'from-blue-500 to-cyan-500' },
    { id: 'streaming', name: 'Streaming Setup', price: 'KSh 2,000', icon: <Video size={24} />, color: 'from-purple-500 to-pink-500' },
    { id: 'competitive', name: 'Competitive Esports', price: 'KSh 5,000', icon: <Trophy size={24} />, color: 'from-red-500 to-orange-500' },
    { id: 'premium', name: 'Premium Gaming PC', price: 'KSh 10,000', icon: <Cpu size={24} />, color: 'from-green-500 to-emerald-500' }
]

export const consultationBenefits = [
    { icon: <CheckCircle size={20} />, title: 'Expert Advice', desc: 'Consult with Kenya\'s top gaming hardware specialists' },
    { icon: <Shield size={20} />, title: 'Warranty Coverage', desc: 'All recommendations include warranty options available in Kenya' },
    { icon: <Award size={20} />, title: 'Best Value', desc: 'Get the best performance for your Kenyan Shilling budget' },
    { icon: <Users size={20} />, title: 'Community Access', desc: 'Join Nairobi\'s gaming community after consultation' }
]

export const hardwareCategories = [
    { name: 'Gaming PCs', icon: <Monitor size={24} />, items: ['Custom Builds', 'Pre-built Systems', 'Upgrade Solutions'] },
    { name: 'Peripherals', icon: <Mouse size={24} />, items: ['Gaming Mice', 'Mechanical Keyboards', 'Headsets'] },
    { name: 'Monitors', icon: <Monitor size={24} />, items: ['144Hz+ Gaming', '4K Displays', 'Ultrawide'] },
    { name: 'Accessories', icon: <Headphones size={24} />, items: ['Gaming Chairs', 'RGB Lighting', 'Streaming Gear'] }
]

export const budgetRanges = [
    { range: 'Under KSh 20,000', description: 'Entry-level gaming setup' },
    { range: 'KSh 20,000 - 50,000', description: 'Mid-range performance' },
    { range: 'KSh 50,000 - 100,000', description: 'High-end gaming' },
    { range: 'KSh 100,000+', description: 'Premium esports setup' }
]