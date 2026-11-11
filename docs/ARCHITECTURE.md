# Dating App - replit.md

## Overview

This is a modern dating application built with a full-stack TypeScript architecture. The app features a four-part grid profile layout, avatar chat functionality, and clean white background with pink accent colors. Users can discover potential matches through detailed grid profiles, engage in anonymous avatar chats, and transition to real profile conversations after mutual agreement.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: White background with light pink, coral pink, and pink accent colors.
Profile layout: Four-part grid system with circular profile image.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom pink theme and CSS variables
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API with JSON responses
- **Request Handling**: Express middleware for JSON parsing and logging
- **Error Handling**: Centralized error handling middleware

### Database & ORM
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for serverless database connections

## Key Components

### Data Models
- **Users**: Profile information including name, age, bio, location, occupation, and photo
- **Swipes**: User interactions (like/pass) with other users
- **Matches**: Mutual likes between users
- **Conversations**: Chat threads between matched users

### Frontend Components
- **SwipeCard**: Main card component with gesture-based swiping
- **MatchModal**: Celebration modal shown when users match
- **ProfileCard**: User profile display component
- **MatchesList**: List of matched users and conversations
- **UserProfile**: Current user's profile management

### Backend Routes
- `GET /api/users` - Fetch all users
- `GET /api/users/:userId/potential-matches` - Get unviewed profiles
- `POST /api/swipes` - Record user swipe actions
- Additional routes for matches and conversations

## Data Flow

1. **User Discovery**: Frontend fetches potential matches from backend
2. **Swiping**: User gestures trigger API calls to record swipe decisions
3. **Match Detection**: Backend checks for mutual likes when processing swipes
4. **Real-time Updates**: React Query automatically refetches data after mutations
5. **State Management**: Client-side state managed through React Query cache

## External Dependencies

### UI & Styling
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Dynamic className generation

### Development Tools
- **Vite**: Build tool with HMR and optimized production builds
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast TypeScript compilation for production

### Database & Validation
- **Zod**: Schema validation for API requests and responses
- **Drizzle Zod**: Integration between Drizzle ORM and Zod validation

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite provides instant updates during development
- **Type Checking**: `npm run check` validates TypeScript across the project

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: `npm run db:push` applies schema changes

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Replit Integration**: Special handling for Replit development environment

The application uses a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack. The mobile-first design ensures optimal user experience on smartphones while maintaining desktop compatibility.