const PORT = process.env.PORT || 5000;

require("dotenv").config();

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MegaGamers254 - Kenya's Premier Gaming Hub</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #0F0F0F;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .hero {
            text-align: center;
            padding: 4rem 2rem;
            background: #1E1E1E;
            border-radius: 4px;
            border: 1px solid #2A2A2A;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 2rem;
            background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            font-weight: bold;
            color: #FFFFFF;
            box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 20px 40px rgba(255, 107, 107, 0.5); }
            100% { transform: scale(1); box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }
        }

        h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            font-weight: 800;
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .tagline {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            color: #B0B0B0;
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }

        .feature {
            padding: 2rem;
            background: #252525;
            border-radius: 4px;
            border: 1px solid #2A2A2A;
            transition: all 0.3s ease;
            text-align: left;
        }

        .feature:hover {
            transform: translateY(-5px);
            border-color: #4ECDC4;
            box-shadow: 0 10px 30px rgba(78, 205, 196, 0.2);
        }

        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
            color: #FF6B6B;
        }

        .feature h3 {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #FFFFFF;
        }

        .feature p {
            color: #B0B0B0;
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .api-section {
            margin-top: 3rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .api-link {
            display: inline-block;
            padding: 1rem 2rem;
            background: #252525;
            color: #FFFFFF;
            text-decoration: none;
            border-radius: 4px;
            border: 1px solid #2A2A2A;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .api-link:hover {
            background: #FF6B6B;
            border-color: #FF6B6B;
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }

        .api-link.docs {
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
            border: none;
        }

        .api-link.docs:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
        }

        .featured-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #FF6B6B;
            color: #FFFFFF;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-radius: 4px;
            margin-bottom: 2rem;
        }

        .store-links {
            margin: 2rem 0;
            display: flex;
            justify-content: center;
            gap: 1rem;
        }

        .store-btn {
            display: inline-block;
            padding: 1rem 3rem;
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }

        .store-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(78, 205, 196, 0.4);
        }

        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .tagline { font-size: 1.2rem; }
            .hero { padding: 2rem 1rem; }
            .store-btn { padding: 0.8rem 2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <span class="featured-badge">🎮 PREMIUM GAMING STORE KENYA</span>
            
            <div class="logo">
                <span>MG</span>
            </div>
            
            <h1>MegaGamers254</h1>
            <p class="tagline">Kenya's #1 Destination for Gaming Gear</p>

            <div class="store-links">
                <a href="https://megagamers254.com" class="store-btn">
                    🛒 VISIT OUR STORE
                </a>
            </div>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🎮</div>
                    <h3>Premium Gaming Gear</h3>
                    <p>Consoles, accessories, and peripherals from top global brands</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💻</div>
                    <h3>Custom Gaming Rigs</h3>
                    <p>High-performance PCs built for competitive gaming and streaming</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚚</div>
                    <h3>Fast Delivery</h3>
                    <p>Free delivery in Nairobi • Same-day shipping • Nationwide coverage</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💳</div>
                    <h3>Secure Payments</h3>
                    <p>M-Pesa, Visa, Mastercard • 100% secure transactions</p>
                </div>
            </div>

            <div class="api-section">
                <a href="https://megagamers254.com/products" class="api-link">
                    🛍️ Shop Now
                </a>
                <a href="https://megagamers254.com/products" class="api-link">
                    🔥 Hot Deals
                </a>
                <a href="https://megagamers254.com/products" class="api-link">
                    📞 Contact Us
                </a>
    
            </div>
        </div>
    </div>
</body>
</html>
`;

module.exports = { html };
