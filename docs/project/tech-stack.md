# MakanManager Technology Stack

## Overview

This document outlines all the technologies, frameworks, libraries, and tools used in the MakanManager project. This information is crucial for developers and AI agents to understand the technical foundation of the system.

## Frontend Technologies

### Core Framework
- **React 18** - Modern React with concurrent features
- **TypeScript 5.x** - Type-safe JavaScript development
- **Vite 5.x** - Fast build tool and development server

### UI & Styling
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animation library (if used)

### State Management
- **React Context API** - Built-in state management
- **Custom Hooks** - Reusable state logic
- **React Query/TanStack Query** - Server state management

### PWA Features
- **Service Workers** - Offline functionality and caching
- **Web App Manifest** - App-like experience
- **Workbox** - Service worker utilities

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React integration for i18next

## Backend Technologies

### Runtime & Framework
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.x** - Web application framework
- **TypeScript** - Type-safe backend development

### Database & ORM
- **PostgreSQL 14+** - Primary database
- **Drizzle ORM** - Type-safe SQL query builder
- **Prisma** - Alternative ORM (if used)

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcrypt** - Password hashing
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### File Handling
- **Multer** - File upload middleware
- **Sharp** - Image processing
- **fs-extra** - Enhanced file system operations

### Scheduling & Background Jobs
- **node-cron** - Cron job scheduling
- **Bull** - Job queue management (if used)

## Development Tools

### Build & Bundling
- **Vite** - Frontend build tool
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking

### Package Management
- **npm** - Node.js package manager
- **package.json** - Dependency management

## Database & Storage

### Primary Database
- **PostgreSQL 14+** - Relational database
- **Drizzle ORM** - Type-safe database operations
- **Database Migrations** - Schema versioning

### File Storage
- **Local File System** - File storage on server
- **Image Optimization** - Responsive image handling

## Deployment & Infrastructure

### Containerization
- **Docker** - Application containerization
- **Docker Compose** - Multi-container orchestration

### Process Management
- **PM2** - Node.js process manager
- **Nginx** - Reverse proxy and web server

### Environment Management
- **Environment Variables** - Configuration management
- **dotenv** - Environment variable loading

## Testing & Quality Assurance

### Testing Frameworks
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing
- **Supertest** - API endpoint testing

### Code Coverage
- **Istanbul/nyc** - Code coverage reporting
- **Coveralls** - Coverage badge integration

## Monitoring & Logging

### Application Monitoring
- **Console Logging** - Basic application logging
- **Error Tracking** - Error monitoring and reporting

### Performance Monitoring
- **Performance APIs** - Web performance metrics
- **Service Worker Metrics** - PWA performance tracking

## Security Tools

### Security Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - API abuse prevention

### Data Protection
- **Input Validation** - Data sanitization
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Cross-site scripting prevention

## Version Control & Collaboration

### Version Control
- **Git** - Source code version control
- **GitHub** - Code hosting and collaboration

### Documentation
- **Markdown** - Documentation format
- **JSDoc** - Code documentation (if used)

## Browser Support

### Modern Browsers
- **Chrome 90+** - Full feature support
- **Firefox 88+** - Full feature support
- **Safari 14+** - Full feature support
- **Edge 90+** - Full feature support

### PWA Support
- **Service Worker Support** - Required for PWA features
- **HTTPS Required** - Production PWA requirements

## Performance & Optimization

### Frontend Optimization
- **Code Splitting** - Lazy loading of components
- **Tree Shaking** - Unused code elimination
- **Image Optimization** - Responsive images and lazy loading
- **Bundle Analysis** - Bundle size optimization

### Backend Optimization
- **Database Indexing** - Query performance optimization
- **Connection Pooling** - Database connection management
- **Caching Strategies** - Response caching
- **Compression** - Response compression

## Development Workflow

### Development Environment
- **Local Development** - Vite dev server
- **Hot Module Replacement** - Fast development iteration
- **TypeScript Compilation** - Real-time type checking

### Build Process
- **Development Build** - Unoptimized development build
- **Production Build** - Optimized production build
- **Asset Optimization** - Minification and compression

## Dependencies & Versions

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "express": "^4.18.0",
  "postgresql": "^14.0.0",
  "drizzle-orm": "^0.28.0"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.2.0",
  "@types/node": "^18.0.0",
  "eslint": "^8.0.0",
  "prettier": "^3.0.0"
}
```

## Future Technology Considerations

### Potential Upgrades
- **React 19** - Latest React features
- **Vite 6** - Next-generation build tool
- **PostgreSQL 16** - Latest database features
- **Node.js 20+** - LTS version support

### New Technologies to Consider
- **Bun** - Alternative JavaScript runtime
- **Turbo** - Monorepo build system
- **tRPC** - End-to-end typesafe APIs
- **Zod** - Runtime type validation

---

*This document should be updated whenever the technology stack changes.*
