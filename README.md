# Makan Moments Staff Points & Tasks PWA

A comprehensive restaurant staff management Progressive Web Application (PWA) designed to streamline operations, task management, and staff engagement through a gamified points system.

## 🏪 About

Makan Moments is a full-featured restaurant management system that combines task management, staff coordination, inventory tracking, and performance analytics in a modern, responsive web application. The system supports multiple user roles and provides tools for both operational staff and management.

**Original Figma Design**: [Makan Moments Staff Points & Tasks PWA](https://www.figma.com/design/AJeRFJEX3erX6s8wqAZUpm/Makan-Moments-Staff-Points---Tasks-PWA)

## ✨ Features

### 🎯 Core Management
- **Task Management** - Create, assign, and track tasks with points-based rewards
- **Staff Directory** - Comprehensive staff profiles with roles and performance tracking
- **Leaderboard System** - Gamified performance rankings with weekly/monthly points
- **Real-time Dashboard** - Live operational overview with key metrics and quick actions

### 🍽️ Restaurant Operations
- **Online Orders** - Order management and tracking system
- **Cash Management** - Daily cash reconciliation with approval workflows
- **Kitchen Management** - Recipe database with ingredients, allergens, and preparation steps
- **Staff Meals** - Track staff meal consumption and costs
- **Inventory & Purchasing** - Purchase list management with supplier integration
- **Waste Tracking** - Monitor and categorize food disposal

### 📊 Analytics & Reporting
- **Performance Reports** - Comprehensive analytics dashboard
- **Skills Matrix** - Track staff competencies and training needs
- **Salary Management** - Payroll integration and salary tracking
- **Issue Tracking** - Report and manage operational issues

### 🔧 System Features
- **Multi-language Support** - English, Bahasa Indonesia, Tiếng Việt, မြန်မာဘာသာ
- **Role-based Access Control** - Owner, Manager, Head of Kitchen, Staff roles
- **Progressive Web App** - Installable, offline-capable mobile experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Global Search** - Quick search across all system data
- **Real-time Notifications** - Instant updates and alerts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Docker (for local database)

### Installation

1. **Clone and navigate to the project**
   ```bash
   git clone <repo-url>
   cd MakanManager
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the database (optional)**
   ```bash
   docker-compose up -d
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

The application will be available at `http://localhost:3000`

### 📚 Documentation

For comprehensive documentation, setup guides, and troubleshooting, see the [Documentation](./docs/README.md) folder:

- **[Setup Guide](./docs/development/setup.md)** - Complete development environment setup
- **[Architecture](./docs/project/architecture.md)** - System architecture and design
- **[API Documentation](./docs/development/api-docs.md)** - API endpoints and usage
- **[Database Schema](./docs/development/database-schema.md)** - Database structure and relationships
- **[Troubleshooting](./docs/troubleshooting/fix.md)** - Common issues and solutions
- **[Changelog](./docs/maintenance/changelog.md)** - Version history and changes

## 🏗️ Tech Stack

### Core Framework
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite 5.4.19** - Fast build tool and development server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
  - Dialog, Dropdown, Select, Accordion, and 20+ components
- **Lucide React** - Beautiful, customizable icons
- **class-variance-authority** - Component variant management

### State & Data Management
- **React Hooks** - Built-in state management
- **Form Handling** - react-hook-form for complex forms
- **Charts & Visualization** - Recharts for analytics

### Enhanced UX
- **Sonner** - Toast notifications
- **next-themes** - Dark/light mode support
- **cmdk** - Command palette interface
- **Vaul** - Mobile drawer components

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx         # Button variants
│   │   ├── card.tsx           # Card layouts
│   │   ├── dialog.tsx         # Modal dialogs
│   │   └── ...                # 40+ UI components
│   ├── layout/                # Layout components
│   │   ├── app-layout.tsx     # Basic layout
│   │   └── enhanced-app-layout.tsx # Advanced responsive layout
│   ├── pages/                 # Page components
│   │   ├── dashboard.tsx      # Main dashboard
│   │   ├── tasks.tsx          # Task management
│   │   ├── staff.tsx          # Staff directory
│   │   ├── leaderboard.tsx    # Performance rankings
│   │   ├── recipes.tsx        # Recipe management
│   │   ├── online-orders.tsx  # Order management
│   │   ├── cash.tsx           # Cash reconciliation
│   │   ├── purchase-list/     # Purchase management
│   │   └── ...                # Additional pages
│   ├── modals/                # Modal components
│   └── figma/                 # Figma-generated components
├── lib/                       # Data and utilities
│   ├── types.ts              # TypeScript definitions
│   ├── data.ts               # Core application data
│   ├── *-data.ts            # Feature-specific data
│   └── utils.ts              # Utility functions
├── styles/                   # Global styles
└── guidelines/               # Development guidelines
```

## 👥 User Roles & Permissions

### 🏢 Management Roles
- **Owner** - Full system access, financial oversight
- **Manager** - Operations management, staff oversight, reporting
- **Head of Kitchen** - Kitchen operations, recipe management, inventory
- **Front Desk Manager** - Customer service, order management

### 👨‍🍳 Staff Role
- **Staff** - Task completion, personal metrics, basic order processing

## 🎮 Task & Points System

### Task Management
- **Task Creation** - Assign tasks with due dates and point values
- **Status Tracking** - Open, In Progress, On Hold, Pending Review, Done
- **Proof Requirements** - Photo, text, checklist, or no proof needed
- **Recurring Tasks** - Daily, weekly, monthly, or custom schedules

### Points & Rewards
- **Base Points** - Standard point value for task completion
- **Multipliers** - Performance-based point multipliers
- **Leaderboard Rankings** - Weekly and monthly competitions
- **Reward Thresholds** - Configurable rewards for point milestones

## 🌐 Internationalization

The system supports multiple languages with complete UI translation:

- 🇺🇸 **English** (en)
- 🇮🇩 **Bahasa Indonesia** (id) 
- 🇻🇳 **Tiếng Việt** (vi)
- 🇲🇲 **မြန်မာဘာသာ** (my)

Language switching is available in both desktop and mobile interfaces.

## 📱 Mobile Experience

### Progressive Web App Features
- **Installable** - Add to home screen capability
- **Offline Support** - Core functionality works offline
- **Push Notifications** - Real-time task and order alerts
- **Mobile-Optimized** - Touch-friendly interface design

### Responsive Design
- **Mobile-First** - Optimized for small screens
- **Tablet Support** - Enhanced layout for medium screens  
- **Desktop Experience** - Full-featured desktop interface

## 🔍 Search & Navigation

### Global Search (⌘/Ctrl + K)
- **Universal Search** - Find pages, orders, staff, recipes, tasks
- **Quick Access** - Keyboard shortcuts for common actions
- **Recent Items** - Quick access to recently viewed content

### Enhanced Navigation
- **Pinned Items** - Customize frequently used sections
- **Collapsible Groups** - Organized navigation categories
- **Badge Indicators** - Notification counts on menu items

## 🛠️ Development

### Code Quality
- **TypeScript** - Full type safety across the application
- **Component Organization** - Clear separation of concerns
- **Reusable Components** - Extensive UI component library
- **Consistent Styling** - Unified design system implementation

### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Setup
The project uses Vite configuration with:
- **SWC** for fast React compilation
- **Path aliases** for clean imports
- **Port 3000** default development server
- **Auto-open** browser on start

## 📈 Key Metrics Dashboard

The dashboard provides real-time insights into:
- **Daily Sales** - Current revenue vs targets
- **Task Completion** - Team productivity metrics  
- **Staff Performance** - Individual and team rankings
- **Order Volume** - Online order processing status
- **Cash Flow** - Daily reconciliation status
- **Issue Tracking** - Open issues requiring attention

## 🔄 Data Management

### Mock Data Structure
The application includes comprehensive mock data for:
- **Staff Profiles** - Complete employee information
- **Task Database** - Various task types and statuses
- **Recipe Collection** - Detailed recipes with ingredients
- **Order History** - Sample customer orders
- **Financial Records** - Cash and salary data
- **Notification System** - Sample notifications and alerts

### Future Backend Integration
The current architecture is designed to easily integrate with:
- **REST APIs** - Standard HTTP API integration
- **Real-time Updates** - WebSocket or Server-Sent Events
- **Database Systems** - SQL or NoSQL database backends
- **Authentication Services** - OAuth, JWT, or custom auth
- **File Upload** - Image and document management

## 🎨 Design System

### Color System
- **Primary Colors** - Brand identity colors
- **Semantic Colors** - Success, warning, error, info states  
- **Neutral Palette** - Text and background variations
- **Dark Mode Support** - Complete dark theme implementation

### Typography
- **Font System** - Consistent heading and body text scales
- **Responsive Typography** - Scalable text across device sizes

### Component Variants
- **Button Variants** - Primary, secondary, outline, ghost styles
- **Card Layouts** - Various content presentation formats
- **Status Indicators** - Chips, badges, and progress components

## 🚀 Deployment

### Build Configuration
- **Output Directory** - `build/` folder for production files
- **ES Next Target** - Modern JavaScript for better performance
- **Vite Optimizations** - Automatic code splitting and optimization

### Recommended Hosting
- **Vercel** - Optimal for React/Vite applications
- **Netlify** - Great PWA support with form handling
- **Firebase Hosting** - Google Cloud integration
- **Traditional Web Servers** - Apache, Nginx with static files

## 📚 Additional Documentation

- [RECIPE_CRUD_README.md](RECIPE_CRUD_README.md) – Detailed recipe management operations.
- [TASK_CRUD_README.md](TASK_CRUD_README.md) – Task management workflows and CRUD examples.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow the existing code style** and TypeScript conventions
4. **Test your changes** thoroughly across device sizes
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## 📝 License

This project was generated from Figma designs using Figma Make. Please refer to your Figma subscription and usage rights for licensing information regarding the original design assets.

## 🔗 Links

- **Original Figma Design**: [Makan Moments Staff Points & Tasks PWA](https://www.figma.com/design/AJeRFJEX3erX6s8wqAZUpm/Makan-Moments-Staff-Points---Tasks-PWA)
- **React Documentation**: [https://react.dev](https://react.dev)
- **Vite Documentation**: [https://vitejs.dev](https://vitejs.dev)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **Radix UI**: [https://www.radix-ui.com](https://www.radix-ui.com)

---

**Built with ❤️ for restaurant teams everywhere**