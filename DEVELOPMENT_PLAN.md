# Travel Inspirator - Development Plan

## Project Overview
Family Travel Sharing App that allows families to document and share travel experiences through interactive maps, with features for creating places, routes, family group management, and photo sharing.

## Tech Stack
- **Frontend**: React 18+ with TypeScript and Tailwind CSS
- **Build Tool**: Vite with Hot Module Replacement (HMR)
- **State Management**: Redux Toolkit
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time subscriptions)
- **Mapping**: Leaflet.js with OpenStreetMap
- **Routing**: React Router with protected routes
- **Location Services**: Photon API for autocomplete
- **Database**: PostgreSQL with PostGIS for geographic data

## Development Tasks

### ✅ Completed Tasks

1. **Project Setup**
   - Set up project structure with Vite, React, TypeScript, and Tailwind CSS
   - Configure Supabase backend with local development setup (CLI + Docker)
   - Create database schema with migrations in supabase/migrations/
   - Implement Row Level Security (RLS) policies for all tables
   - Set up TypeScript types generation from database schema
   - Create typed Supabase client with Database type

2. **Core Application**
   - Implement Redux Toolkit store structure for state management
   - Create authentication system with Supabase Auth
   - Build React Router setup with protected routes
   - Implement map interface with Leaflet.js and OpenStreetMap

3. **Data Management**
   - Create setup_data.sh script for test users and seed data
   - Create place entry form with autocomplete using Photon API
   - Implement family group management system with upsert operations

4. **Bug Fixes & Improvements**
   - Fix infinite recursion in RLS policies completely
   - Simplify navigation with Back to Dashboard buttons
   - Fix place autocomplete dropdown behavior
   - Fix PostGIS coordinate parsing for map centering
   - Improve UI/UX: move Back to Dashboard button to left, fix autocomplete dropdown, remove duplicate Dashboard nav items
   - Fix Recent Places click functionality on Dashboard

5. **Internationalization & Settings**
   - Create Settings page with language switching (CZ/EN)
   - Add Czech translations throughout the entire app
   - Add currency selection with persistence for price entries
   - Add country flags to place cards for easier identification
   - Make places public by default with private checkbox option
   - Allow family members to edit places associated with their family
   - Move Settings to user dropdown menu in header with Sign Out

6. **Route Creation System** ✅ **COMPLETED**
   - Update database schema for enhanced routes functionality
   - Create RouteBuilder component for route creation
   - Implement WaypointList with drag & drop functionality
   - Add route management to Redux store
   - Create comprehensive route form with metadata (difficulty, transport mode, duration)
   - Implement place selection with search and filtering
   - Add visual waypoint management with start/end indicators
   - Enable route sharing within family groups
   - Fix TypeScript compilation errors for routes functionality

7. **Dashboard Map Integration** ✅ **COMPLETED**
   - Add central map to Dashboard showing all places and routes
   - Implement route visualization with colored polylines
   - Create MapLegend component for route identification
   - Fix Dashboard layout responsiveness with minimum height constraints

8. **Repository Setup** ✅ **COMPLETED**
   - Create GitHub repository with comprehensive description
   - Initialize git repository with all project files
   - Create detailed initial commit with feature documentation
   - Push complete project to GitHub at https://github.com/vitakul/travel-inspirator

9. **Route Visualization System** ✅ **COMPLETED**
   - Create interactive RouteMap component with comprehensive path visualization
   - Implement Leaflet Routing Machine with OSRM integration for real routing paths
   - Add per-segment routing based on transport_to_next field (walking/driving/cycling)
   - Create numbered waypoint markers with start/end indicators
   - Implement drag & drop waypoint editing with database updates
   - Add transport mode indicators between waypoints
   - Fix RLS permissions for collaborative route editing
   - Enhance route display with proper cleanup and real-time updates

### 🔄 In Progress Tasks

- None currently

### 📋 Pending Tasks

#### High Priority

#### Medium Priority
- **Photo Management**: Add photo upload functionality with Supabase Storage
  - Create photo upload component
  - Implement image optimization and thumbnails
  - Add photo gallery for places and routes
  - Enable photo sharing within family groups

#### Low Priority
- **Search & Filtering**: Create search and filtering interface
  - Add place search functionality
  - Implement category and rating filters
  - Create date range filtering
  - Add family group filtering

- **Real-time Features**: Implement real-time updates with Supabase subscriptions
  - Real-time place updates
  - Live family activity feed
  - Real-time collaboration on routes

- **Mobile & Responsive**: Add responsive design and mobile optimization
  - Mobile-first responsive design
  - Touch-optimized map interactions
  - Progressive Web App (PWA) features
  - Offline functionality

## Database Schema

### Core Tables
- `users` - User profiles linked to Supabase Auth
- `family_groups` - Family group management (max 5 members)
- `family_members` - Many-to-many relationship between users and groups
- `places` - Geographic locations with categories, ratings, and metadata
- `routes` - Travel routes connecting multiple places with enhanced metadata
  - `estimated_duration`, `difficulty_level`, `transport_mode`, `total_distance`
- `route_places` - Many-to-many relationship for route waypoints with enhanced features
  - `transport_to_next`, `notes`, `estimated_time`, `order_index`
- `photos` - Image storage metadata linked to places/routes

### Key Features
- PostGIS integration for geographic queries
- Row Level Security (RLS) for data protection
- Enum types for place categories, family roles, route difficulty, and transport modes
- JSONB fields for flexible metadata storage
- Database functions for enhanced queries (`get_routes_with_details`, `get_route_waypoints`)

## Development Workflow

### Local Development
1. **Start Supabase**: `supabase start`
2. **Run Dev Server**: `npm run dev` (port 5173)
3. **Type Generation**: `npm run types`
4. **Test Data**: `./recreate_data.sh`

### Test Accounts
- **john@example.com** (password: password123) - Family Admin
- **jane@example.com** (password: password123) - Family Member

### Key Commands
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run types` - Generate TypeScript types from Supabase
- `supabase db reset` - Reset local database
- `./recreate_data.sh` - Recreate test data

## Technical Architecture

### State Management
- Redux Toolkit slices for places, family, auth, routes
- Async thunks for API calls with comprehensive CRUD operations
- Typed selectors and dispatchers
- Route management with waypoint ordering and transport configuration

### Map Integration
- Leaflet.js with React wrapper for interactive mapping
- Leaflet Routing Machine with OSRM for real routing paths
- Custom MapController for automatic centering and bounds fitting
- PostGIS coordinate extraction with `get_places_with_coordinates()` function
- RouteMap component with numbered waypoints and drag & drop editing
- Per-segment routing based on transport modes (walking/driving/cycling)
- Transport mode indicators and waypoint popups with editing capabilities

### Authentication Flow
- Supabase Auth with protected routes
- User profile management
- Session persistence

### API Integration
- Photon API for location autocomplete
- Supabase RPC functions for complex queries
- Proper error handling and loading states

## Known Issues Resolved

1. **PostGIS Coordinate Parsing**: Fixed binary data issue by creating `get_places_with_coordinates()` function with proper geometry casting
2. **RLS Policy Recursion**: Resolved infinite recursion by simplifying policies and using security invoker functions
3. **Navigation Issues**: Fixed 406 errors by replacing static links with React Router NavLinks
4. **Modal Z-Index**: Fixed modals appearing behind map using React Portals and high z-index values
5. **Autocomplete Dropdown**: Fixed persistence issues with proper state management and click-outside detection
6. **Development Workflow**: Implemented single dev server approach with Vite HMR instead of multiple servers

## Next Steps

1. **Photo Upload Feature** - Add image management with Supabase Storage
2. **Enhanced Search** - Create advanced filtering and search capabilities
3. **Real-time Updates** - Implement live collaboration features
4. **Mobile Optimization** - Ensure responsive design across all devices

## GitHub Repository

**Repository URL**: https://github.com/vitakul/travel-inspirator

The complete Travel Inspirator project has been successfully pushed to GitHub with all implemented features including:
- React + TypeScript + Supabase architecture
- Interactive mapping with Leaflet.js and Leaflet Routing Machine
- Complete route creation system with waypoint management
- Advanced route visualization with real routing paths and numbered waypoints
- Drag & drop waypoint editing with database updates
- Per-segment routing based on transport modes (walking/driving/cycling)
- Transport mode indicators and comprehensive waypoint popups
- Multi-language support (Czech/English)
- Family group management with collaborative editing
- Currency selection and country flag detection
- Responsive Dashboard with central map visualization

---

*Last Updated: July 30, 2025*