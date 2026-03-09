import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
const ShopLinks = ({ footerLinks }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-3">
                {footerLinks.shop.map((link, index) => (
                    <li key={index}>
                        <Link
                            to={link.link}
                            className="text-gray-400 hover:text-primary transition text-sm flex items-center group"
                        >
                            <ArrowRight size={12} className="mr-2 opacity-0 group-hover:opacity-100 transition" />
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ShopLinks