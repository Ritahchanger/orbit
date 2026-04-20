import { toast } from "react-hot-toast";

import { useDispatch } from "react-redux";

import { openChat } from "../../admin-support-chat/slices/SupportChartSlice";

const SupportCard = () => {
  const dispatch = useDispatch();

  const handleContactSupport = () => {
    toast.success("Opening support chat...");
    dispatch(openChat());
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-sm p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        Need Help?
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Our support team is available 24/7 to assist you with any questions.
      </p>
      <button
        onClick={handleContactSupport}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition-colors text-sm font-medium"
      >
        Contact Support
      </button>
    </div>
  );
};

export default SupportCard;
