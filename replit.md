# Rest Express Application

## Overview

This is a modern full-stack web application built with React and Express, featuring a monorepo structure. The application uses TypeScript throughout, implements a PostgreSQL database with Drizzle ORM, and includes a comprehensive UI component library based on shadcn/ui. The architecture supports both development and production environments with proper build processes and database migrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Vite Build Tool**: Fast development server and optimized production builds
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Comprehensive component library based on shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens

### Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **Modular Routing**: Centralized route registration system in `/api` prefix structure
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations
- **Development/Production Separation**: Environment-specific configurations with proper error handling
- **Static File Serving**: Integrated static file serving for production builds

### Database Layer
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Schema Management**: Centralized schema definitions in shared directory
- **Migration System**: Database migration support with drizzle-kit
- **Connection**: Neon Database serverless PostgreSQL integration

### Development Tools
- **Hot Module Replacement**: Vite HMR for fast development iterations
- **Type Safety**: Comprehensive TypeScript configuration across client, server, and shared code
- **Path Aliases**: Simplified imports with @ aliases for better code organization
- **Build Process**: Optimized production builds with ESBuild for server code

### Project Structure
- **Monorepo Layout**: Client, server, and shared code in organized directories
- **Shared Types**: Common schemas and types accessible to both frontend and backend
- **Component Organization**: Hierarchical UI component structure with reusable primitives
- **Configuration Files**: Centralized configuration for build tools, database, and development

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection for Neon Database
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight client-side routing library

### UI and Component Libraries
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, form controls, etc.)
- **class-variance-authority**: Type-safe component variant management
- **tailwindcss**: Utility-first CSS framework for styling
- **lucide-react**: Modern icon library for React components

### Development and Build Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **esbuild**: Fast JavaScript bundler for server code
- **typescript**: Type checking and compilation
- **drizzle-kit**: Database migration and introspection tools

### Form and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation (via drizzle-zod)

### Additional Libraries
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings
- **cmdk**: Command palette component
- **embla-carousel-react**: Touch-friendly carousel component