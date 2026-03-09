import "./ballspinner.css";

const BallSpinner = ({
    size = 120,
    message = "Loading...",
    colors = {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#06B6D4',
        glow: '#60A5FA'
    },
    speed = 1.5,
    showMessage = true,
    variant = "floating", // 'floating', 'orbital', 'pulse', 'bubble', 'vortex'
    intensity = 0.8,
    shadow = true
}) => {
    const halfSize = size / 2;
    const ballRadius = size * 0.15;

    // Get variant-specific settings
    const getVariantSettings = () => {
        const settings = {
            floating: {
                animation: "float3d",
                duration: speed * 2,
                balls: 8,
                spread: 0.7
            },
            orbital: {
                animation: "orbit3d",
                duration: speed,
                balls: 12,
                spread: 1
            },
            pulse: {
                animation: "pulse3d",
                duration: speed * 1.5,
                balls: 6,
                spread: 0.5
            },
            bubble: {
                animation: "bubble",
                duration: speed * 2,
                balls: 8,
                spread: 0.6
            },
            vortex: {
                animation: "vortex",
                duration: speed * 1.2,
                balls: 10,
                spread: 0.8
            }
        };
        return settings[variant] || settings.floating;
    };

    const variantSettings = getVariantSettings();

    // Generate positions for orbiting balls
    const generateBallPositions = () => {
        const positions = [];
        const numBalls = variantSettings.balls;
        
        for (let i = 0; i < numBalls; i++) {
            const angle = (i * 2 * Math.PI) / numBalls;
            const distance = halfSize * variantSettings.spread;
            
            positions.push({
                x: halfSize + Math.cos(angle) * distance,
                y: halfSize + Math.sin(angle) * distance,
                color: i % 2 === 0 ? colors.primary : colors.secondary,
                delay: i * (speed / numBalls)
            });
        }
        
        return positions;
    };

    const ballPositions = generateBallPositions();

    return (
        <div className="flex flex-col items-center justify-center">
            {/* Main Spinner Container */}
            <div
                className="relative"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                }}
            >
                {/* Central Glowing Core */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: `${ballRadius * 2}px`,
                        height: `${ballRadius * 2}px`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle at 30% 30%, ${colors.primary}, ${colors.secondary})`,
                        boxShadow: shadow 
                            ? `0 0 ${size * 0.2}px ${size * 0.1}px ${colors.glow}40,
                               0 0 ${size * 0.3}px ${size * 0.15}px ${colors.accent}30,
                               inset 0 0 ${size * 0.1}px ${colors.primary}80`
                            : 'none',
                        animation: `pulseCore ${speed * 2}s ease-in-out infinite`,
                        zIndex: 10
                    }}
                >
                    {/* Inner sparkle */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: `${ballRadius * 0.4}px`,
                            height: `${ballRadius * 0.4}px`,
                            left: '30%',
                            top: '30%',
                            background: `radial-gradient(circle, white, transparent 70%)`,
                            filter: 'blur(1px)'
                        }}
                    />
                </div>

             
                {/* Connection Lines (for orbital variant) */}
                {variant === 'orbital' && (
                    <svg
                        width={size}
                        height={size}
                        className="absolute inset-0"
                    >
                        <defs>
                            <radialGradient id="line-glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.1" />
                            </radialGradient>
                        </defs>
                        {ballPositions.map((ball, index) => {
                            const nextBall = ballPositions[(index + 1) % ballPositions.length];
                            return (
                                <line
                                    key={`line-${index}`}
                                    x1={ball.x}
                                    y1={ball.y}
                                    x2={nextBall.x}
                                    y2={nextBall.y}
                                    stroke="url(#line-glow)"
                                    strokeWidth="1"
                                    strokeOpacity="0.5"
                                    className="animate-pulse"
                                />
                            );
                        })}
                    </svg>
                )}

                {/* Outer Glow Ring */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: `${size * 1.2}px`,
                        height: `${size * 1.2}px`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle, ${colors.glow}20, transparent 70%)`,
                        animation: 'rotateSlow 10s linear infinite',
                        filter: 'blur(10px)',
                        opacity: intensity * 0.5
                    }}
                />
            </div>

            {/* Loading Message */}
            {showMessage && (
                <div className="mt-8 text-center">
                    <p className="text-gray-300 font-medium text-sm mb-3 tracking-wider">
                        {message}
                    </p>
                    {/* Animated dots */}
                    <div className="flex justify-center space-x-2">
                        {[0, 1, 2].map((dot) => (
                            <div
                                key={dot}
                                className="rounded-full"
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: colors.primary,
                                    animation: `bounceDot 1.4s ease-in-out infinite`,
                                    animationDelay: `${dot * 0.2}s`,
                                    opacity: 0.7
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BallSpinner;