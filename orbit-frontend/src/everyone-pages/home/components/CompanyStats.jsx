const CompanyStats = ({ companyStats }) => {
    return (
        <section className="bg-[#1E1E1E] rounded-sm md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-4 gap-6">
                {companyStats.map((stat, index) => (
                    <div key={index} className="text-center p-6 bg-[#252525] rounded-sm hover:bg-[#2a2a2a] transition group">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition">
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default CompanyStats