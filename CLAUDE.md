# Family Travel Inspirator - Development Guide

## Project Overview
A family travel sharing platform that allows families to document and share travel experiences through interactive maps. Users can create routes, mark places, add photos and practical information, and share experiences with other families.

## 🚀 Current Implementation Status

### ✅ Completed Features
- **Authentication System**: Complete sign up/sign in with Supabase Auth
- **Protected Routes**: React Router with authentication guards
- **Interactive Maps**: Leaflet.js integration with OpenStreetMap
- **Place Management**: Full CRUD operations with location search
- **Route Creation System**: Complete route builder with waypoint management
  - RouteBuilder component with comprehensive form (difficulty, transport mode, duration)
  - WaypointList with drag & drop reordering and visual indicators
  - PlaceSelector with search and filtering capabilities
  - Enhanced database schema with route metadata and transport configuration
- **Advanced Route Visualization & Editing**: Complete interactive map-based route display and editing
  - RouteMap component with real routing paths using Leaflet Routing Machine and OSRM
  - Per-segment routing based on individual transport modes (walking/driving/cycling with distinct routing profiles)
  - Visual differentiation with colors and line styles for each transport mode segment
  - Numbered waypoint markers with distinct start (green), end (red), and waypoint (blue) indicators
  - Drag & drop waypoint editing with database updates and real-time route recalculation
  - Transport mode indicators between waypoints with popup information
  - Comprehensive waypoint popups with inline editing capabilities (transport mode, estimated time, notes)
  - Enhanced RLS permissions for collaborative route editing (migration 20240101000012)
  - Robust route cleanup and state management for seamless updates
- **Dashboard Map Integration**: Central map showing all places and routes with colored polylines
- **Modal System**: Reusable modal components with proper z-index handling
- **State Management**: Redux Toolkit with typed slices for auth, places, family, routes
- **Database Schema**: Complete PostgreSQL schema with RLS policies and enhanced route functionality
- **Internationalization**: Full Czech/English translation support with language switching
- **Settings Management**: User preferences for language, currency, and privacy settings
- **Real-time Data**: Supabase subscriptions for live updates
- **Responsive Design**: Mobile-first Tailwind CSS implementation
- **GitHub Repository**: Complete project pushed to https://github.com/vitakul/travel-inspirator

### 🎯 Key User Flows
1. **Authentication**: Sign up → Email confirmation → Sign in → Dashboard
2. **Place Creation**: Dashboard/Places → Add Place → Location search → Form submission → Map update
3. **Route Creation**: Routes → Create Route → Add waypoints → Configure transport → Save route
4. **Navigation**: Dashboard ↔ Places ↔ Routes ↔ Family Groups
5. **Map Interaction**: Click map → Create place → Auto-populate coordinates
6. **Settings**: Header dropdown → Settings → Language/Currency selection → Save preferences

### 🧪 Test Environment
- **Dev Server**: http://localhost:5173 (Vite HMR enabled)
- **Database**: Local Supabase instance with Docker
- **Test Accounts**: 
  - `john@example.com` / `password123` (Family Admin)
  - `jane@example.com` / `password123` (Family Member)
- **Sample Data**: 
  - 13 sample places (4 Prague, 4 Czech Republic, 5 Poland)
  - 3 comprehensive test routes with real waypoints and transport modes
  - 1 family group with complete test scenarios
- **Route Testing**: Advanced route visualization with OSRM real routing, numbered waypoints, drag & drop editing, and per-segment transport mode differentiation

## Tech Stack
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, Redux Toolkit
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Maps**: Leaflet.js with OpenStreetMap, Leaflet Routing Machine with OSRM
- **Build Tool**: Vite
- **Testing**: Jest
- **Deployment**: Netlify

## Development Commands

### Setup
```bash
npm install
npm run dev
```

### Vite Development Server & HMR
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build project and check TypeScript errors
- `npm run preview` - Preview production build locally

#### 🔥 Hot Module Replacement (HMR) Best Practices
1. **Start server once**: `npm run dev` - Keep running throughout development
2. **Automatic reloading**: Vite HMR detects file changes and updates browser instantly
3. **Preserves state**: Component state maintained during updates
4. **Error checking**: Use `npm run build` to verify TypeScript without restarting server
5. **Consistent URL**: Always use http://localhost:5173 throughout development

#### ⚠️ Avoid Multiple Dev Servers
- **Don't restart unnecessarily** - HMR handles most changes automatically
- **Only restart for**: Major config changes, dependency updates, or port conflicts
- **Kill existing servers**: `pkill -f "vite.*dev"` if multiple servers are running

### Database
- `supabase start` - Start local Supabase instance (requires Docker)
- `supabase db push` - Apply pending migrations without losing data (PREFERRED)
- `supabase db push --dry-run` - Preview what migrations would be applied
- `supabase db reset` - ⚠️ DESTRUCTIVE: Reset local database with migrations (ONLY use when absolutely necessary)
- `supabase db diff` - Generate migration files from schema changes
- `npx supabase gen types typescript --local > src/integrations/supabase/types.ts` - Regenerate TypeScript types
- `./setup_data.sh` - Setup test users and seed data (idempotent - preserves existing data)
- `./fix_data.sh` - Fix data issues (profiles without names, places without owners)
- `./recreate_data.sh` - ⚠️ DESTRUCTIVE: Recreate test users and seed data (only after db reset)

### ⚠️ IMPORTANT: Database Migration Best Practices
1. **NEVER use `supabase db reset` unless absolutely necessary** - it wipes all data
2. **Always use `supabase db push` to apply new migrations** - preserves existing data
3. **Run `supabase db push --dry-run` first** to preview changes
4. **Only reset database if there are breaking schema changes** that require it
5. **Always run `./recreate_data.sh` after a reset** to restore test data

### 🔧 Common Data Issues & Solutions

**Problem: "No data in app after database operations"**
- **Symptoms**: App shows no places, profiles missing names, user can't create family groups
- **Root Cause**: Database operations can leave profiles without proper names and places without ownership
- **Quick Fix**: Run `./fix_data.sh` to repair data relationships
- **Prevention**: Use `./setup_data.sh` instead of `./recreate_data.sh` when possible

**Migration Workflow Summary:**
1. For schema changes: `supabase db push` (preserves data)
2. For data issues: `./fix_data.sh` (repairs relationships)
3. For clean slate: `supabase db reset` + `./recreate_data.sh` (nuclear option)

## Database Schema

### Core Tables
- **users** - User profiles and authentication
- **family_groups** - Family group management (max 5 members)
- **family_members** - Junction table for group membership
- **places** - Travel destinations with location data
- **routes** - Collections of connected places with enhanced metadata
  - `estimated_duration`, `difficulty_level`, `transport_mode`, `total_distance`
- **route_places** - Junction table for route-place relationships with waypoint features
  - `transport_to_next`, `notes`, `estimated_time`, `order_index`
- **photos** - Image storage references

### Key Features
- Row Level Security (RLS) on all tables
- Geographic indexes for location queries
- Enum types for route difficulty and transport modes
- Database functions for enhanced queries (`get_routes_with_details`, `get_route_waypoints`)
- Real-time subscriptions for collaborative features
- Public/private content filtering

## Database Operations

### Common Patterns
- Always use typed Supabase client with Database type
- Implement RLS policies for data security
- Use upsert operations for create/update scenarios
- Handle auth state in queries (user-specific data)

### Supabase Integration
- Local development requires Supabase CLI and Docker
- Database migrations in `supabase/migrations/`
- Types auto-generated from database schema
- Environment variables for local/remote switching

## State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  places: PlacesState;
  routes: RoutesState;
  family: FamilyState;
  settings: SettingsState;
}
```

### Real-time Updates
- Supabase subscriptions for live collaboration
- Optimistic updates for better UX
- Conflict resolution for concurrent edits

## API Integration

### External APIs
- **OpenStreetMap/Photon API** - Place autocomplete and geocoding (implemented)
- **Leaflet.js** - Interactive map rendering (implemented)
- **Supabase Storage** - Image upload and management (pending)

### Data Flow
1. User interactions update local state
2. Redux actions trigger API calls
3. Supabase handles persistence and real-time sync
4. Components re-render with updated data

## Component Architecture

### Core Components
- `Modal` - Reusable modal with React Portal and z-index handling
- `PlaceForm` - Comprehensive place creation with location autocomplete
- `RouteBuilder` - Complete route creation form with waypoint management
- `RouteMap` - Advanced route visualization with OSRM routing, numbered waypoints, and drag & drop editing
- `WaypointList` - Drag & drop waypoint ordering with visual indicators
- `PlaceSelector` - Modal for selecting places with search and filtering
- `MapComponent` - Leaflet integration with click handlers and markers
- `Navigation` - React Router NavLink-based navigation
- `Header` - Shared app header with user dropdown and settings
- `PlaceCard` - Place display component with ratings and categories

### Page Structure
- `Dashboard` - Overview with quick actions and recent places
- `Places` - Place management with search, filtering, and map interaction
- `Routes` - Complete route creation and management with RouteBuilder integration
- `Family` - Family group management interface
- `Settings` - User preferences for language, currency, and privacy settings

### State Slices
- `authSlice` - User authentication and profile management
- `placesSlice` - Place CRUD operations and filtering
- `routesSlice` - Route management with waypoint ordering and transport configuration
- `familySlice` - Family group management and member operations
- `settingsSlice` - User preferences for language, currency, and privacy

## Security Considerations

### Row Level Security Policies
- Users can only access their family group data
- Public content filtering based on is_public flag
- Admin-only operations for family group management

### Authentication
- Supabase Auth with JWT tokens
- Protected routes in React Router
- Session management and refresh handling

## Performance Optimization

### Caching Strategy
- React Query for API cache management
- LocalStorage for offline data
- Service Worker for PWA support

### Map Performance
- Marker clustering for dense areas
- Lazy loading of route details
- Geographic bounds optimization

## Testing Strategy

### Unit Tests
- Component testing with Jest/React Testing Library
- Redux store and action testing
- Utility function testing

### Integration Tests
- API integration testing
- Authentication flow testing
- Map interaction testing

## Deployment

### Environment Setup
- Development: Local Supabase instance
- Production: Hosted Supabase project
- Environment variables for API keys and URLs

### CI/CD Pipeline
- GitHub Actions for automated testing
- Netlify deployment on merge to main
- Database migration deployment strategy

## Code Style Guidelines

### TypeScript
- Strict type checking enabled
- Interface definitions for all API responses
- Generic types for reusable components

### React
- Functional components with hooks
- Custom hooks for business logic
- Component composition over inheritance

### CSS
- Tailwind CSS utility classes
- Component-scoped styles when needed
- Responsive design patterns

## 🔧 Troubleshooting

### Common Issues

#### Modal Z-Index Problems
**Symptoms**: Modal appears behind map or other elements
**Solution**: Modal uses React Portal + high z-index (10000+)
```css
.modal-overlay {
  z-index: 10000 !important;
}
.leaflet-container {
  z-index: 1;
}
```

#### Authentication Errors
**Symptoms**: "Invalid login credentials" for test accounts
**Solution**: Run `./recreate_data.sh` to recreate auth users properly

#### Multiple Dev Servers
**Symptoms**: Port conflicts, changing localhost URLs
**Solution**: 
```bash
# Kill all existing servers
pkill -f "vite.*dev"
# Start single server
npm run dev
# Use http://localhost:5173 consistently
```

#### Database Connection Issues
**Symptoms**: "Connection refused" or RLS policy errors
**Solution**: 
```bash
# Check Supabase status
supabase status
# Restart if needed
supabase stop && supabase start
```

## 📋 Development Checklist

### Before Starting Development
- [ ] Supabase instance running (`supabase start`)
- [ ] Dev server running on port 5173 (`npm run dev`)
- [ ] Test data loaded (`./recreate_data.sh`)
- [ ] Browser at http://localhost:5173

### Before Committing Changes
- [ ] TypeScript build passes (`npm run build`)
- [ ] All modals/forms functional
- [ ] Authentication flow working
- [ ] Map interactions responsive
- [ ] No console errors in browser

### Deployment Preparation
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Production build successful
- [ ] All tests passing

## 🐙 GitHub Repository

**Repository URL**: https://github.com/vitakul/travel-inspirator

The complete Travel Inspirator project has been successfully pushed to GitHub with comprehensive documentation and all implemented features. The repository includes:

### 📁 Repository Structure
- Full React + TypeScript + Supabase project setup
- Database migrations with PostgreSQL + PostGIS schema
- Complete component library with route creation system
- Multi-language translations (Czech/English)
- Comprehensive documentation and setup guides

### 🚀 Key Features Included
- Advanced interactive mapping with Leaflet.js, Leaflet Routing Machine, and OSRM routing
- Complete route builder with drag & drop waypoint management and real-time route visualization
- Numbered waypoint markers with drag & drop editing and database updates
- Per-segment routing based on transport modes (walking/driving/cycling)
- Transport mode indicators and comprehensive waypoint popups with inline editing
- Family group management with collaborative editing permissions
- Currency selection and country flag detection
- Settings management with language preferences
- Responsive Dashboard with central map showing places and routes

### 📋 Development Resources
- **Setup Scripts**: Database initialization and test data creation
- **Type Definitions**: Generated TypeScript types from Supabase schema
- **Development Workflow**: HMR setup with Vite and best practices
- **Troubleshooting Guide**: Common issues and solutions

## 📋 Detailed Development Plan

For comprehensive task tracking, implementation roadmap, and technical architecture details, see:
**[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)**

The development plan includes:
- Complete task breakdown with status tracking
- Database schema documentation
- Technical architecture overview
- Known issues and solutions
- Next steps and priorities
- GitHub repository information