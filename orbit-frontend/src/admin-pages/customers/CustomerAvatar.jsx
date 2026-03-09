const CustomerAvatar = ({ name }) => {
    return (
        <div className="shrink-0 h-10 w-10 bg-linear-to-br from-primary to-[#00D4FF] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {name}
        </div>
    )
}

export default CustomerAvatar