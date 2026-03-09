// communityData.js
export const nairobiGamingEvents = [
    {
        id: 1,
        title: 'Nairobi Esports Championship',
        date: '2024-03-15',
        time: '2:00 PM',
        location: 'Mega Gamers Store, Tom Mboya Street',
        type: 'Tournament',
        game: 'Call of Duty: Warzone',
        prize: 'KSh 100,000',
        participants: 128,
        status: 'upcoming',
        description: 'Nairobi\'s premier Call of Duty tournament featuring top Kenyan players',
        featured: true
    },
    {
        id: 2,
        title: 'FIFA 25 Kenya Cup',
        date: '2024-03-20',
        time: '4:00 PM',
        location: 'Sarit Centre, Westlands',
        type: 'Tournament',
        game: 'FIFA 25',
        prize: 'KSh 50,000',
        participants: 64,
        status: 'upcoming',
        description: 'National FIFA championship open to all Kenyan players'
    },
    {
        id: 3,
        title: 'Gaming Setup Workshop',
        date: '2024-03-10',
        time: '11:00 AM',
        location: 'Mega Gamers Store',
        type: 'Workshop',
        game: 'PC Building',
        prize: 'Free Consultation',
        participants: 40,
        status: 'upcoming',
        description: 'Learn PC building and optimization from Kenya\'s top tech experts'
    },
    {
        id: 4,
        title: 'Women in Gaming Nairobi',
        date: '2024-02-25',
        time: '3:00 PM',
        location: 'iHub, Ngong Road',
        type: 'Meetup',
        game: 'Various',
        prize: 'Networking',
        participants: 85,
        status: 'past',
        description: 'Empowering Kenyan women in the gaming industry'
    }
]

export const kenyanGamers = [
    {
        id: 1,
        name: 'Brian "Prodigy" Omondi',
        role: 'Esports Pro',
        game: 'Call of Duty',
        location: 'Nairobi',
        achievements: ['Kenya Champion 2023', 'ESL Africa Top 10'],
        avatar: 'BO',
        isOnline: true,
        rank: 1
    },
    {
        id: 2,
        name: 'Sarah "Queen_Slay" Wanjiku',
        role: 'Streamer',
        game: 'Valorant',
        location: 'Mombasa',
        achievements: ['10K+ Followers', 'Gaming Awards Nominee'],
        avatar: 'SW',
        isOnline: true,
        rank: 2
    },
    {
        id: 3,
        name: 'David "Tech_Guru" Kamau',
        role: 'PC Builder',
        game: 'Hardware Expert',
        location: 'Nairobi',
        achievements: ['Custom Build Expert', 'Setup Consultant'],
        avatar: 'DK',
        isOnline: false,
        rank: 3
    },
    {
        id: 4,
        name: 'Grace "PixelQueen" Akinyi',
        role: 'Content Creator',
        game: 'Fortnite',
        location: 'Kisumu',
        achievements: ['YouTube Partner', 'Community Leader'],
        avatar: 'GA',
        isOnline: true,
        rank: 4
    }
]

export const localGamingCommunities = [
    {
        id: 1,
        name: 'Nairobi Gamers United',
        members: '2,500+',
        focus: 'Multi-game',
        platform: 'Discord & WhatsApp',
        link: '/community/nairobi-gamers',
        icon: '🌆'
    },
    {
        id: 2,
        name: 'Kenya Esports Federation',
        members: 'Official',
        focus: 'Competitive Gaming',
        platform: 'Website & Telegram',
        link: '/community/kesports',
        icon: '🏆'
    },
    {
        id: 3,
        name: 'PC Masters Kenya',
        members: '800+',
        focus: 'PC Building & Tech',
        platform: 'Facebook Group',
        link: '/community/pc-masters',
        icon: '💻'
    },
    {
        id: 4,
        name: 'Women Gamers KE',
        members: '1,200+',
        focus: 'Inclusive Gaming',
        platform: 'Instagram & Meetups',
        link: '/community/women-gamers',
        icon: '👩‍💻'
    }
]

export const communityStats = [
    { value: '5,000+', label: 'Nairobi Members', icon: '👥' },
    { value: '200+', label: 'Monthly Events', icon: '📅' },
    { value: '50+', label: 'Local Tournaments', icon: '🏆' },
    { value: '24/7', label: 'Kenya Discord', icon: '💬' }
]