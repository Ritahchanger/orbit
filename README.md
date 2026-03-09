# 🌟 Orbit - Advanced Multi-Store Management System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org/)

> A comprehensive enterprise-grade platform for managing multiple retail stores, inventory, sales, and team operations with advanced role-based access control.

## 📋 Table of Contents

- [Overview](#overview)
- [Problems We Solve](#problems-we-solve)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Role-Based Access Control](#role-based-access-control)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Orbit** is a full-stack multi-store management system designed to streamline retail operations across multiple locations. Built with modern web technologies, Orbit provides real-time inventory tracking, comprehensive sales analytics, team management, and customer engagement tools—all within a single, unified platform.

Whether you're managing a single store or a chain of retail locations, Orbit gives you the tools to maintain visibility, control costs, and scale efficiently.

## 🔧 Problems We Solve

### 1. **Multi-Store Management Complexity**
**Problem:** Managing multiple retail locations with separate systems leads to fragmented data, inconsistent processes, and poor visibility across stores.

**Solution:** Orbit centralizes all store operations into a single platform, providing real-time visibility across all locations with store-specific dashboards and cross-store reporting.

### 2. **Inventory Control & Stock Visibility**
**Problem:** Retailers struggle with stockouts, overstocking, and lack of real-time inventory visibility across multiple locations.

**Solution:** Real-time inventory tracking with automated alerts, cross-store transfer management, and predictive analytics to optimize stock levels and reduce carrying costs.

### 3. **Access Control & Security**
**Problem:** Generic admin systems lack granular permissions, creating security risks and limiting operational flexibility.

**Solution:** Advanced role-based access control (RBAC) with four distinct roles (Cashier, Manager, Admin, Superadmin), each with precisely defined permissions for secure, scalable team management.

### 4. **Disconnected Customer Engagement**
**Problem:** Retailers lack integrated tools to communicate with customers, gather feedback, and build community.

**Solution:** Built-in newsletter management, consultation booking system, and community features to engage customers and drive repeat business.

### 5. **Manual Sales & Reporting**
**Problem:** Time-consuming manual reporting processes delay decision-making and hide critical business insights.

**Solution:** Automated sales tracking, real-time analytics dashboards, and comprehensive reporting tools that provide actionable insights instantly.

### 6. **Payment Processing Challenges**
**Problem:** Managing multiple payment methods and reconciling transactions across stores is error-prone and time-consuming.

**Solution:** Integrated payment processing with M-Pesa support, automated reconciliation, and detailed transaction tracking.

### 7. **Inefficient Team Management**
**Problem:** Coordinating staff across multiple locations, managing schedules, and tracking performance is complex and manual.

**Solution:** Centralized worker management with role assignments, performance tracking, and store-specific team organization.

## ✨ Key Features

### 🏪 Store Management
- Multi-store configuration and management
- Store-specific dashboards and analytics
- Cross-store inventory transfers
- Location-based access control

### 📦 Inventory Management
- Real-time stock tracking across all locations
- Low stock alerts and reorder notifications
- Product categorization and brand management
- Batch operations and bulk updates

### 💰 Sales & Payments
- Point-of-sale (POS) integration
- M-Pesa payment processing
- Transaction history and reconciliation
- Sales performance analytics

### 👥 Team Management
- Role-based access control (RBAC)
- Worker profiles and performance tracking
- Store-specific team assignments
- Permission management system

### 📊 Analytics & Reporting
- Real-time sales dashboards
- Inventory analytics and trends
- Store performance comparisons
- Custom report generation

### 🛍️ Product Management
- Comprehensive product catalog
- Category and brand organization
- Product variants and pricing
- Image management and galleries

### 📧 Customer Engagement
- Newsletter creation and distribution
- Consultation booking system
- Community forum
- Customer feedback collection

### 🔐 Security & Permissions
- Four-tier role hierarchy (Cashier → Manager → Admin → Superadmin)
- Granular permission controls
- API key management
- Audit logging

## 🏗️ System Architecture

Orbit follows a modern microservices-inspired architecture with three main components:

```
┌─────────────────────────────────────────────────────────┐
│                    Orbit Ecosystem                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │Desktop Admin │  │   Backend    │  │
│  │    (React)   │  │  (Electron)  │  │  (Node.js)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                           │                             │
│                    ┌──────▼───────┐                     │
│                    │   REST API   │                     │
│                    └──────┬───────┘                     │
│                           │                             │
│                    ┌──────▼───────┐                     │
│                    │   MongoDB    │                     │
│                    └──────────────┘                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Components

1. **mega-gamers-frontend**: Customer-facing web application (React + Vite)
2. **mega-gamers-admin**: Desktop admin application (Electron)
3. **mega-gamers-backend**: RESTful API server (Node.js + Express)

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.x
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** Context API + Custom Hooks

### Desktop Admin
- **Framework:** Electron
- **UI:** React Components
- **Process Management:** Main/Renderer Pattern

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT
- **Payment:** M-Pesa API Integration
- **Process Manager:** PM2

### DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx
- **CI/CD:** GitHub Actions Ready
- **Monitoring:** PM2 Ecosystem

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
mongodb >= 6.0
docker >= 20.10 (optional)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ritahchanger/mega-gamers.git
cd mega-gamers
```

2. **Install dependencies for all projects**
```bash
# Backend
cd mega-gamers-backend
npm install

# Frontend
cd ../mega-gamers-frontend
npm install

# Desktop Admin
cd ../mega-gamers-admin
npm install
```

3. **Set up environment variables**

Create `.env` files in each project directory:

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/orbit
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Orbit
```

4. **Initialize MongoDB**
```bash
# Start MongoDB
mongod

# Run database initialization (from project root)
mongosh < mongo-init.js
```

5. **Start development servers**

```bash
# Terminal 1 - Backend
cd mega-gamers-backend
npm run dev

# Terminal 2 - Frontend
cd mega-gamers-frontend
npm run dev

# Terminal 3 - Desktop Admin (optional)
cd mega-gamers-admin
npm start
```

6. **Access the applications**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin Login: http://localhost:5173/admin/login

### Default Admin Credentials

After running seeders, use these credentials:
```
Email: superadmin@orbit.com
Password: Super@Admin123
```

## 🔐 Role-Based Access Control

Orbit implements a four-tier role hierarchy with granular permissions:

| Role | Access Level | Key Permissions |
|------|-------------|-----------------|
| **Cashier** | Basic Operations | - View dashboard<br>- View products (read-only)<br>- Process sales<br>- View own profile |
| **Manager** | Store-Level Management | - All Cashier permissions<br>- Manage products (edit)<br>- View inventory reports<br>- Access store analytics<br>- Generate reports |
| **Admin** | Multi-Store Operations | - All Manager permissions<br>- Manage stores<br>- View cross-store data<br>- Inventory management<br>- Advanced reporting |
| **Superadmin** | Full System Control | - All Admin permissions<br>- Worker management<br>- System settings<br>- Database operations<br>- API key management<br>- Newsletter & analytics<br>- Permission configuration |

### Route Access Matrix

```
Route                          Cashier  Manager  Admin  Superadmin
─────────────────────────────────────────────────────────────────
/admin/dashboard                 ✓        ✓       ✓        ✓
/admin/products (view)           ✓        ✓       ✓        ✓
/admin/products/:id (edit)       ✗        ✓       ✓        ✓
/admin/inventory                 ✗        ✓       ✓        ✓
/admin/reports                   ✗        ✓       ✓        ✓
/admin/stores                    ✗        ✗       ✓        ✓
/admin/workers                   ✗        ✗       ✗        ✓
/admin/newsletter                ✗        ✗       ✗        ✓
/admin/analytics                 ✗        ✗       ✗        ✓
/admin/system/*                  ✗        ✗       ✗        ✓
/admin/payments                  ✗        ✗       ✗        ✓
/admin/profile                   ✓        ✓       ✓        ✓
```

## ⚙️ Configuration

### Using Make Commands

The project includes a Makefile for common operations:

```bash
# Development
make dev              # Start all services in development mode
make dev-backend      # Start only backend
make dev-frontend     # Start only frontend

# Production
make build            # Build all services for production
make start            # Start production services
make stop             # Stop all services

# Docker
make docker-up        # Start Docker containers
make docker-down      # Stop Docker containers
make docker-logs      # View container logs

# Database
make db-seed          # Seed database with sample data
make db-reset         # Reset and reseed database
```

### Environment-Specific Configuration

#### Development
```bash
npm run dev
```

#### Production
```bash
# Build frontend
cd mega-gamers-frontend
npm run build

# Start backend with PM2
cd mega-gamers-backend
pm2 start ecosystem.config.js --env production
```

## 🐳 Deployment

### Docker Deployment

1. **Development Environment**
```bash
docker-compose up -d
```

2. **Production Environment**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

#### Backend (PM2)
```bash
cd mega-gamers-backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Frontend (Nginx)
```bash
cd mega-gamers-frontend
npm run build

# Copy build to nginx
sudo cp -r dist/* /var/www/orbit/
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/orbit;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Cloud Deployment Options

- **AWS**: EC2 + RDS MongoDB / DocumentDB
- **Google Cloud**: Compute Engine + Cloud MongoDB
- **DigitalOcean**: Droplets + Managed MongoDB
- **Heroku**: Web Dynos + MongoDB Atlas

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
POST   /api/auth/logout            Logout user
GET    /api/auth/me                Get current user
PUT    /api/auth/update-password   Update password
```

### Product Endpoints

```
GET    /api/products               Get all products
GET    /api/products/:id           Get product by ID
POST   /api/products               Create product (Admin+)
PUT    /api/products/:id           Update product (Manager+)
DELETE /api/products/:id           Delete product (Admin+)
```

### Store Endpoints

```
GET    /api/stores                 Get all stores (Admin+)
GET    /api/stores/:id             Get store by ID (Admin+)
POST   /api/stores                 Create store (Admin+)
PUT    /api/stores/:id             Update store (Admin+)
DELETE /api/stores/:id             Delete store (Superadmin)
```

### Inventory Endpoints

```
GET    /api/inventory              Get inventory (Manager+)
GET    /api/inventory/:storeId     Get store inventory (Manager+)
PUT    /api/inventory/:id          Update stock levels (Manager+)
POST   /api/inventory/transfer     Transfer stock between stores (Admin+)
```

For complete API documentation, visit: `/api/docs` (when server is running)

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd mega-gamers-backend
npm test

# Frontend tests
cd mega-gamers-frontend
npm test

# E2E tests
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ritah Changer** - *Initial work* - [@Ritahchanger](https://github.com/Ritahchanger)

## 🙏 Acknowledgments

- MongoDB for database solutions
- React team for the amazing framework
- Electron for desktop capabilities
- M-Pesa for payment integration

## 📞 Support

For support, email support@orbit.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced AI-powered analytics
- [ ] Multi-currency support
- [ ] WhatsApp integration for notifications
- [ ] Barcode scanner integration
- [ ] Supplier management module
- [ ] Customer loyalty program
- [ ] Advanced reporting with PDF export

---

**Built with ❤️ by the Orbit Team**