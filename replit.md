# Overview

FormCraft is a comprehensive form builder application that allows users to create, customize, and deploy interactive forms with specialized question types. The application supports three main question types: categorization (drag items into categories), cloze (fill in the blanks), and comprehension (reading comprehension with multiple choice questions). Built with a modern React frontend and Express.js backend, the system provides a visual form builder interface and a responsive form-filling experience.

**Recent Updates (Aug 2025):**
- Added Vercel deployment configuration with Supabase integration
- Implemented real image storage with Supabase Storage
- Enhanced form builder UI with collapsible settings and better UX
- Added automatic scoring system with detailed score breakdown
- Configured production-ready PostgreSQL database setup

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing with three main routes (home, form builder, form fill)
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Management**: React Hook Form with Zod validation for robust form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Storage Strategy**: Dual storage implementation with in-memory storage for development and PostgreSQL for production
- **API Design**: RESTful endpoints for CRUD operations on forms and responses with proper error handling
- **Development Server**: Vite integration for hot module replacement and fast development builds

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Supabase hosting (production) / Neon Database (development)
- **Image Storage**: Supabase Storage for production images, data URLs for development
- **ORM**: Drizzle ORM for schema definition, migrations, and type-safe queries
- **Schema Design**: Two main tables (forms and responses) with JSONB columns for flexible question storage
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple

## Deployment Configuration
- **Platform**: Vercel with serverless functions
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage for images
- **Environment**: Production-ready with environment variable configuration
- **Build Process**: Optimized for Vercel deployment with proper build scripts

## Form Builder Features
- **Question Types**: Three specialized question types with unique interfaces and validation
- **Visual Editor**: Drag-and-drop interface for adding questions with real-time preview
- **Form Customization**: Support for form metadata (title, description, header images)
- **Preview Mode**: Modal-based form preview with link generation for sharing

## Authentication and Data Handling
- **Validation**: Zod schemas for runtime type checking and validation on both client and server
- **Error Handling**: Comprehensive error boundaries and toast notifications for user feedback
- **File Upload**: Mock file upload system with support for image attachments
- **Response Collection**: Structured response storage with form-to-response relationships

# External Dependencies

## Database and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database connection for scalable data storage
- **drizzle-orm**: Modern TypeScript ORM for type-safe database operations and migrations
- **drizzle-kit**: CLI tool for database schema management and migrations

## UI and Styling
- **@radix-ui/***: Collection of low-level UI primitives for building accessible components
- **tailwindcss**: Utility-first CSS framework for rapid styling and responsive design
- **class-variance-authority**: Utility for creating type-safe component variants
- **lucide-react**: Icon library providing consistent iconography throughout the application

## React Ecosystem
- **@tanstack/react-query**: Server state management library for data fetching and caching
- **react-hook-form**: Performant forms library with minimal re-renders
- **wouter**: Lightweight routing library as an alternative to React Router

## Development Tools
- **vite**: Fast build tool and development server with TypeScript support
- **@replit/vite-plugin-***: Replit-specific plugins for development environment integration
- **esbuild**: Fast JavaScript bundler for production builds

## Validation and Type Safety
- **zod**: TypeScript-first schema validation library for runtime type checking
- **@hookform/resolvers**: Validation resolvers for integrating Zod with React Hook Form