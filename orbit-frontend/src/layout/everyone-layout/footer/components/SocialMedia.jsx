const SocialMedia = ({socialMedia}) => {
    return (
        <div>
            <h3 className="text-white font-semibold mb-3">Connect With Us</h3>
            <div className="flex space-x-3">
                {socialMedia.map((social, index) => (
                    <a
                        key={index}
                        href={social.link}
                        className="w-9 h-9 rounded-sm bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition"
                        aria-label={social.name}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {social.icon}
                    </a>
                ))}
            </div>
        </div>
    )
}

export default SocialMedia