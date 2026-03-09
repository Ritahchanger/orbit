import React from 'react';
import { Loader2, Gamepad2, Shield, Trophy } from 'lucide-react';

const UniversalPreloader = ({
    type = 'spinner',
    size = 'medium',
    color = 'primary',
    message = 'Loading...',
    fullScreen = false,
    showLogo = true,
    theme = 'dark'
}) => {
    // Size mapping
    const sizeMap = {
        small: { container: 'h-16 w-16', icon: 'h-6 w-6', text: 'text-sm' },
        medium: { container: 'h-24 w-24', icon: 'h-10 w-10', text: 'text-base' },
        large: { container: 'h-32 w-32', icon: 'h-14 w-14', text: 'text-lg' },
        xlarge: { container: 'h-48 w-48', icon: 'h-20 w-20', text: 'text-xl' }
    };

    // Color mapping - UPDATED for dark/light theme
    const colorMap = {
        primary: {
            light: 'from-blue-500 to-blue-600',
            dark: 'from-blue-400 to-blue-500'
        },
        secondary: {
            light: 'from-green-500 to-green-600', 
            dark: 'from-green-400 to-green-500'
        },
        white: {
            light: 'from-gray-200 to-gray-300',
            dark: 'from-gray-400 to-gray-500'
        },
        gray: {
            light: 'from-gray-400 to-gray-500',
            dark: 'from-gray-500 to-gray-600'
        }
    };

    // Preloader types - UPDATED with proper dark mode classes
    const preloaderTypes = {
        spinner: (
            <div className={`${sizeMap[size].container} relative`}>
                <div className="absolute inset-0 rounded-full border-4 border-transparent">
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-blue-400 dark:border-r-blue-300 border-b-transparent border-l-transparent animate-spin" style={{ animationDelay: '0.3s' }}></div>
                </div>
                {showLogo && (
                    <div className="absolute inset-6 flex items-center justify-center">
                        <Gamepad2 className={`${sizeMap[size].icon} text-gray-700 dark:text-gray-300`} />
                    </div>
                )}
            </div>
        ),

        dots: (
            <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-3 w-3 rounded-full bg-gray-700 dark:bg-gray-300 animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>
        ),

        bar: (
            <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${colorMap[color].light} dark:${colorMap[color].dark} animate-progress`}></div>
            </div>
        ),

        pulse: (
            <div className={`${sizeMap[size].container} relative`}>
                <div className="absolute inset-0 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping opacity-20"></div>
                <div className="absolute inset-4 rounded-full bg-blue-400 dark:bg-blue-300 animate-pulse"></div>
                {showLogo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Gamepad2 className={`${sizeMap[size].icon} text-gray-700 dark:text-gray-300`} />
                    </div>
                )}
            </div>
        ),

        gaming: (
            <div className={`${sizeMap[size].container} relative`}>
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent">
                    <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-green-500 dark:border-r-green-400 border-b-transparent border-l-transparent animate-spin"></div>
                </div>

                {/* Middle ring */}
                <div className="absolute inset-4 rounded-full border-4 border-transparent">
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-b-blue-400 dark:border-b-blue-300 border-l-transparent animate-spin-reverse"></div>
                </div>

                {/* Inner content */}
                <div className="absolute inset-8 flex items-center justify-center">
                    <div className="relative">
                        <Gamepad2 className={`${sizeMap[size].icon} text-blue-600 dark:text-blue-400 animate-pulse`} />
                        <Trophy className="absolute -top-1 -right-1 h-4 w-4 text-green-500 dark:text-green-400 animate-bounce" />
                    </div>
                </div>
            </div>
        ),

        shield: (
            <div className={`${sizeMap[size].container} relative`}>
                <Shield className={`w-full h-full text-gray-700 dark:text-gray-300 animate-pulse`} />
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 dark:border-blue-300 animate-ping"></div>
            </div>
        ),

        wave: (
            <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="w-2 bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300 rounded-full"
                        style={{
                            height: `${20 + (i * 8)}px`,
                            animation: `wave 1s ease-in-out infinite`,
                            animationDelay: `${i * 0.1}s`
                        }}
                    />
                ))}
            </div>
        )
    };

    // Container class - UPDATED for dark mode
    const containerClass = fullScreen
        ? `fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 backdrop-blur-sm`
        : `flex flex-col items-center justify-center`;

    // Add custom animation keyframes
    const progressStyle = `
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }
    
    @keyframes spin-reverse {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }
    
    @keyframes wave {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.5); }
    }
    
    .animate-progress {
      animation: progress 2s ease-in-out infinite;
    }
    
    .animate-spin-reverse {
      animation: spin-reverse 1.5s linear infinite;
    }
  `;

    return (
        <>
            <style>{progressStyle}</style>
            <div className={containerClass}>
                <div className="mb-4">
                    {preloaderTypes[type]}
                </div>

                {message && (
                    <div className={`text-center ${sizeMap[size].text} text-gray-700 dark:text-gray-300`}>
                        <p className="font-medium">{message}</p>
                        {type === 'gaming' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
                                Preparing your gaming experience...
                            </p>
                        )}
                    </div>
                )}

                {/* Optional loading percentage for bar type */}
                {type === 'bar' && (
                    <div className="mt-2 flex justify-between w-48">
                        <span className="text-xs text-gray-600 dark:text-gray-400">0%</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">100%</span>
                    </div>
                )}

                {/* Optional tips/messages for gaming theme */}
                {type === 'gaming' && fullScreen && (
                    <div className="mt-8 max-w-md text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Did you know?</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Our gaming setups are optimized for maximum performance and minimal latency
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default UniversalPreloader;