# Makan Moments Staff Points & Tasks PWA

## Overview

Makan Moments is a comprehensive restaurant staff management Progressive Web Application (PWA) designed to streamline operations, task management, and staff engagement through a gamified points system. The application serves as a complete restaurant management solution, combining task management, staff coordination, inventory tracking, performance analytics, and financial operations in a modern, responsive web interface.

The system supports multiple user roles (Owner, Manager, Head of Kitchen, Staff) with role-based access control and features multi-language support for English, Bahasa Indonesia, Tiếng Việt, and မြန်မာဘာသာ. The application is built as a PWA, making it installable and offline-capable for mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application is built using React 18 with TypeScript, utilizing modern React patterns including hooks and context providers. The UI framework is based on Radix UI components with Tailwind CSS for styling, providing a consistent design system throughout the application. The routing is handled by React Router DOM v7 for single-page application navigation.

Key architectural decisions:
- **Component Structure**: Organized into pages, modals, and reusable UI components following atomic design principles
- **State Management**: React Context API for global state (Authentication, Language) with local useState for component-specific state
- **Responsive Design**: Mobile-first approach with adaptive layouts for desktop, tablet, and mobile devices
- **Progressive Web App**: Service worker integration for offline capabilities and app-like behavior

### Data Management
The application currently uses mock data structures for development, with plans for backend integration. Data is organized into domain-specific modules:
- **User Management**: Staff profiles, roles, and permissions
- **Task System**: Task creation, assignment, tracking, and completion workflow
- **Operations**: Recipes, inventory, staff meals, waste tracking, and supplier management
- **Financial**: Salary management, cash reconciliation, and purchase tracking
- **Analytics**: Performance reports, leaderboards, and operational metrics

### Authentication & Authorization
Role-based access control system with four primary roles:
- **Owner**: Full system access including financial reports and system administration
- **Manager**: Operational oversight, staff management, and approval workflows
- **Head of Kitchen**: Kitchen operations, recipe management, and inventory control
- **Staff**: Task completion, time tracking, and basic operational functions

The authentication system uses React Context for state management with protected routes ensuring proper access control.

### Real-time Features
The application is designed to support real-time updates through:
- **Notifications System**: Categorized notifications for orders, tasks, approvals, and alerts
- **Live Dashboard**: Real-time operational metrics and quick action buttons
- **Task Updates**: Live status updates and approval workflows

## External Dependencies

### Core Libraries
- **React 18.3.1**: Primary frontend framework with TypeScript support
- **React Router DOM 7.8.2**: Client-side routing and navigation
- **Radix UI**: Comprehensive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Data Visualization
- **Recharts 2.15.2**: Chart library for analytics dashboards and reporting
- **jsPDF & jsPDF-autoTable**: PDF generation for reports and documentation

### UI Enhancement
- **Sonner**: Toast notification system
- **React Hook Form**: Form state management and validation
- **Class Variance Authority**: Component variant management
- **Next Themes**: Dark mode and theme switching

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **ESLint & Prettier**: Code quality and formatting

### Database Integration (Planned)
The application includes PostgreSQL schema references and expects future integration with:
- **PostgreSQL**: Primary database for production data
- **Drizzle ORM**: Database abstraction layer for type-safe queries

### PWA Capabilities
- **Service Worker**: Offline functionality and caching strategies
- **Web App Manifest**: App installation and native-like behavior
- **Responsive Images**: Optimized image loading and fallback handling

The architecture prioritizes modularity, type safety, and scalability while maintaining excellent mobile performance and user experience.
