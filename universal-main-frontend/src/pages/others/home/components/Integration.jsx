import { motion } from "framer-motion";
const Integration = () => {
  const integrations = [
    "M-Pesa",
    "Stripe",
    "PayPal",
    "QuickBooks",
    "SAP",
    "Oracle",
    "Shopify",
    "WooCommerce",
    "Square",
    "Xero",
  ];
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-600 text-lg mb-12">
          Trusted integrations with leading platforms
        </p>

        <div className="relative">
    
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-8"
              animate={{
                x: [0, -1000],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {[...integrations, ...integrations].map((integration, index) => (
                <span
                  key={index}
                  className="text-gray-600 hover:text-gray-900 text-lg font-semibold whitespace-nowrap transition-colors duration-300 cursor-default border-b-2 border-transparent hover:border-blue-500"
                >
                  {integration}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
