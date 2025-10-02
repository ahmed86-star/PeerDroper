# Overview

Droppy is a local file sharing application that enables real-time file transfers, messaging, and device discovery across a local network. The application uses a modern full-stack architecture with React on the frontend and Express.js with WebSocket support on the backend, providing seamless peer-to-peer communication between connected devices.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build Tools**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for fast hot module replacement
- Wouter for lightweight client-side routing (single-page application)
- TanStack Query (React Query) for server state management and API caching

**UI Component System**
- Shadcn UI component library (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming support (light/dark mode ready)
- Font Awesome icons for visual elements

**State Management Pattern**
- Server state managed via TanStack Query with custom query client
- Real-time updates handled through WebSocket custom hook (`useWebSocket`)
- Form state managed with React Hook Form and Zod validation
- Local UI state using React hooks (useState, useEffect)

## Backend Architecture

**Server Framework**
- Express.js application with TypeScript
- WebSocket server (ws library) for real-time bidirectional communication
- Session-based architecture using connect-pg-simple for PostgreSQL session storage
- Multer middleware for handling file uploads (100MB limit)

**Database Layer**
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL with WebSocket support
- Schema-first design with Drizzle Zod for validation
- Connection pooling via Neon's serverless driver

**Database Schema Design**
- `devices` table: Tracks connected devices with type, IP address, and connection status
- `files` table: Stores uploaded file metadata (filename, size, MIME type, uploader)
- `transfers` table: Manages file transfer state with progress tracking and status
- `messages` table: Persists chat messages between devices

**Real-time Communication**
- WebSocket server mounted at `/ws` path for instant updates
- Message types: device_connect, send_message, transfer_progress
- Broadcast mechanism to notify all connected clients of state changes
- Client connection tracking with device association

**File Upload Strategy**
- Local filesystem storage in `uploads/` directory
- File metadata stored in database with references
- Transfer progress tracking through WebSocket updates
- Support for large files up to 100MB

## External Dependencies

**Database**
- Neon Serverless PostgreSQL (via `@neondatabase/serverless`)
- Requires `DATABASE_URL` environment variable
- WebSocket-enabled connection for serverless environments

**UI Libraries**
- Radix UI primitives for accessible components (dialogs, dropdowns, tooltips, etc.)
- QR code scanning via `qr-scanner` library for device pairing
- Date manipulation with `date-fns`
- Form validation with `zod` and `@hookform/resolvers`

**Development Tools**
- Replit-specific plugins for runtime error overlay and cartographer
- TypeScript for type safety across the stack
- ESBuild for production server bundling
- Path aliases configured for cleaner imports (@/, @shared/)

**Third-party Services**
- Font Awesome CDN for icons
- Google Fonts (Inter typeface)
- Replit development banner script for external access