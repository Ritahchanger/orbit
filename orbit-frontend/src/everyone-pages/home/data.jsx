import { Gamepad2, Headphones, Mouse, Keyboard, Cpu } from 'lucide-react'


const categories = [
    {
        name: 'Consoles',
        icon: <Gamepad2 className="text-3xl" size={32} />,
        count: 42,
        link: '/products/category/consoles'
    },
    {
        name: 'Headsets',
        icon: <Headphones className="text-3xl" size={32} />,
        count: 28,
        link: '/products/category/headsets'
    },
    {
        name: 'Mice',
        icon: <Mouse className="text-3xl" size={32} />,
        count: 35,
        link: '/products/category/mice'
    },
    {
        name: 'Keyboards',
        icon: <Keyboard className="text-3xl" size={32} />,
        count: 31,
        link: '/products/category/keyboards'
    },
    {
        name: 'PC Components',
        icon: <Cpu className="text-3xl" size={32} />,
        count: 56,
        link: '/products/category/pc-components'
    },
]

const brands = ['PlayStation', 'Xbox', 'Nintendo', 'Razer', 'Logitech', 'Corsair', 'SteelSeries', 'HyperX']

export { featuredProducts, categories, brands }