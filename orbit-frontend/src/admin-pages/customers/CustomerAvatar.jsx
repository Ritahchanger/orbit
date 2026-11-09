const SIZES = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
};

const CustomerAvatar = ({ name, size = "md", className = "" }) => {
    return (
        <div className={`shrink-0 ${SIZES[size] || SIZES.md} bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
            {name}
        </div>
    )
}

export default CustomerAvatar