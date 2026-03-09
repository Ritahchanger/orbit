
const RenderStep3 = ({formData,handleInputChange,errors}) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-white mb-4">Your Information</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={`w-full rounded-sm bg-gray-900 border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary ${errors.name ? 'border-red-500' : 'border-gray-700'
                            }`}
                        placeholder="Enter your full name"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className={`w-full rounded-sm bg-gray-900 border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary ${errors.phone ? 'border-red-500' : 'border-gray-700'
                                }`}
                            placeholder="07XX XXX XXX"
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className={`w-full rounded-sm bg-gray-900 border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary ${errors.email ? 'border-red-500' : 'border-gray-700'
                                }`}
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Additional Notes (Optional)
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-sm bg-gray-900 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                        placeholder="Tell us about your gaming needs or special requirements..."
                    />
                </div>
            </div>
        </div>
    )

}

export default RenderStep3