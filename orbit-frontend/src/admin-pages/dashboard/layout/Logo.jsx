import { Link } from "react-router-dom";
import "./Logo.css"
const Logo = () => {
    return (
        <Link to="/admin/dashboard" className="flex items-center space-x-2 group">
{/*            
            <div className="relative">

                <div className="relative w-10 h-10 md:w-9 md:h-9 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-2 border-transparent bg-linear-to-r from-primary via-[#00D4FF] to-primary animate-spin-slow">
                        <div className="absolute w-2 h-2 bg-[#00D4FF] rounded-full -top-1 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <div className="absolute w-6 h-6 md:w-7 md:h-7 rounded-full bg-linear-to-br from-primary to-[#00D4FF] shadow-lg shadow-primary/30"></div>
                    <div className="absolute w-3 h-3 bg-white rounded-full -bottom-1 left-1/2 transform -translate-x-1/2 shadow-md shadow-white/20"></div>
                </div>
            </div> */}

            {/* Text */}
            <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-heading font-black tracking-wide">
                    <span className="bg-linear-to-r from-primary via-[#00D4FF] to-primary bg-clip-text text-transparent animate-gradient">
                        ORBIT
                    </span>
                </span>

            </div>
        </Link>
    )
}

export default Logo