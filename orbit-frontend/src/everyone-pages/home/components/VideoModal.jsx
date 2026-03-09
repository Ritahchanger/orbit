import { X } from "lucide-react";

const VideoModal = ({ setIsVideoModalOpen }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4">
        <div className="bg-dark-light rounded-sm border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="text-xl font-semibold text-white">
              Message from Our CEO
            </h3>
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-sm transition"
            >
              <X className="text-gray-400" size={20} />
            </button>
          </div>
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/_hvc42OqpJg"
              title="CEO Message - Mega Gamers"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-6 border-t border-gray-800">
            <h4 className="text-lg font-semibold text-white mb-2">
              SALLY MWENDE
            </h4>
            <p className="text-gray-400">
              CEO & Founder of Mega Gamers. Professional gamer turned
              entrepreneur, dedicated to bringing the best gaming experience to
              players worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
