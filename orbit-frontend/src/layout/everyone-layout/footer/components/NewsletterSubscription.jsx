import { Check, ArrowRight, Mail } from "lucide-react";

const NewsletterSubscription = ({
  showNewsletter,
  handleSubscribe,
  email,
  setEmail,
  isAuthenticated,
  loading,
  subscribed,
  user,
}) => {
  return (
    <div className="mb-6 newsletter-container">
      {showNewsletter ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Mail size={18} className="text-primary" />
            <h3 className="text-white font-semibold  md:text-base">
              Join Our Gaming Community
            </h3>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-3">
            {/* Mobile-optimized input group */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAuthenticated ? user?.email : "Enter your email"}
                className="w-full px-4 py-3 rounded-sm sm:rounded-sm sm:rounded-r-none bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || subscribed}
                required
              />

              <button
                type="submit"
                disabled={
                  loading || subscribed || (!email?.trim() && !isAuthenticated)
                }
                className={`
                  w-full sm:w-auto px-6 py-3 rounded-sm sm:rounded-sm sm:rounded-sm
                  text-sm font-medium transition flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    subscribed
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gradient-to-r from-primary to-[#00D4FF] text-white hover:opacity-90"
                  }
                `}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-sm h-4 w-4 border-2 border-white border-t-transparent"></span>
                    <span className="hidden sm:inline">Subscribing...</span>
                  </>
                ) : subscribed ? (
                  <>
                    <Check size={18} />
                    <span className="hidden sm:inline">Subscribed</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Subscribe</span>
                    <span className="sm:hidden">Join</span>
                    <ArrowRight size={18} className="hidden sm:block" />
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {subscribed ? (
              <div className="flex items-start gap-2 text-sm text-green-400 bg-green-400/10 p-3 rounded-sm">
                <Check size={16} className="mt-0.5 flex-shrink-0" />
                <p>
                  {isAuthenticated
                    ? "You're subscribed to our newsletter!"
                    : "Thanks! Check your email to confirm."}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-primary rounded-sm"></span>
                Get exclusive deals & gaming tips
              </p>
            )}
          </form>
        </>
      ) : (
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-sm border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-sm flex items-center justify-center">
              <Check size={16} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-400 text-sm">
                Newsletter Active
              </h3>
              <p className="text-xs text-gray-400">
                {isAuthenticated
                  ? "You're getting gaming deals & tips"
                  : "You're subscribed to our newsletter"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscription;
