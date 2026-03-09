import { useState, useEffect } from "react";
import { X, Download, Gamepad2 } from "lucide-react";

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user has dismissed before
      const hasDismissed = localStorage.getItem("installPromptDismissed");
      if (!hasDismissed) {
        // Show prompt after 3 seconds
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem("installPromptDismissed", "true");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted install");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50 animate-slideUp">
      <div className="bg-gradient-to-r from-dark-light to-gray-900 border border-primary/30 rounded-lg shadow-2xl p-4 backdrop-blur-md">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Gamepad2 className="text-primary" size={28} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-white text-base mb-1">
              Install Mega Gamers App
            </h3>
            <p className="text-gray-300 text-xs mb-3">
              Get faster access, offline support, and a better gaming
              experience!
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                🚀 Fast Loading
              </span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                📱 Home Screen
              </span>
              <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                ⚡ Offline Mode
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded text-sm font-medium transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
