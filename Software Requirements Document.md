# Family Travel Sharing App - Technical Specification Document

## 1. System Design

### Overview
The application follows a modern JAMstack architecture utilizing:
- React with TypeScript for frontend
- Supabase for backend and real-time functionality
- Netlify for hosting and deployment

### System Components
- **Frontend Application**: React SPA
- **Backend Services**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage for images
- **Maps**: OpenStreetMap with Leaflet

## 2. Architectural Pattern

### Frontend Architecture
- **Pattern**: Redux + Redux Toolkit for state management
- **Component Structure**:
  - Atomic Design pattern
  - Container/Presenter pattern

### Data Flow
- Unidirectional data flow
- State management through Redux
- Real-time updates via Supabase subscriptions

## 3. State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  places: PlacesState;
  routes: RoutesState;
  family: FamilyState;
  ui: UIState;
}
```

### Real-time State Updates
- Supabase real-time subscriptions for:
  - Place updates
  - Route changes
  - Family group modifications

## 4. Data Flow

### Client-Server Communication
1. REST API calls via Supabase client
2. Real-time subscriptions for live updates
3. Optimistic updates for better UX

### Caching Strategy
- React Query for API cache management
- LocalStorage for offline data
- Service Worker for PWA support

## 5. Technical Stack

### Frontend
- React 18+
- TypeScript 5+
- Tailwind CSS
- Redux Toolkit
- React Query
- Leaflet.js for maps

### Backend (Supabase)
- PostgreSQL database
- Real-time subscriptions
- Row Level Security
- Storage for images

### Development Tools
- Vite for build tool
- ESLint + Prettier
- Jest for testing
- GitHub Actions for CI/CD

## 6. Authentication Process

### Flow
1. User registration/login via Supabase Auth
2. JWT token management
3. Route protection with React Router

### Security Measures
- Row Level Security in Supabase
- CORS configuration
- API rate limiting

## 7. Route Design

```typescript
const routes = [
  {
    path: '/',
    component: Dashboard,
    private: true
  },
  {
    path: '/auth',
    component: Auth,
    private: false
  },
  {
    path: '/family/:id',
    component: FamilyView,
    private: true
  },
  {
    path: '/places/new',
    component: PlaceForm,
    private: true
  },
  {
    path: '/routes/:id',
    component: RouteView,
    private: true
  }
]
```

## 8. API Design

### Places API
```typescript
interface Place {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  category: PlaceCategory;
  rating: number;
  photos: string[];
  practical_info: {
    entrance_fee: number;
    parking: boolean;
    description: string;
  };
  created_by: string;
  family_id: string;
  is_public: boolean;
}
```

### Routes API
```typescript
interface Route {
  id: string;
  name: string;
  places: Place[];
  path: GeoJSON;
  created_by: string;
  family_id: string;
  is_public: boolean;
}
```

### Family Groups API
```typescript
interface FamilyGroup {
  id: string;
  name: string;
  admin_id: string;
  members: User[];
  created_at: string;
}
```

## 9. Database Design (ERD)

### Tables

#### users
- id: uuid (PK)
- email: string
- name: string
- created_at: timestamp

#### family_groups
- id: uuid (PK)
- name: string
- admin_id: uuid (FK -> users.id)
- created_at: timestamp

#### family_members
- group_id: uuid (FK -> family_groups.id)
- user_id: uuid (FK -> users.id)
- role: string
- joined_at: timestamp

#### places
- id: uuid (PK)
- name: string
- location: point
- category: string
- rating: integer
- practical_info: jsonb
- created_by: uuid (FK -> users.id)
- family_id: uuid (FK -> family_groups.id)
- is_public: boolean
- created_at: timestamp

#### routes
- id: uuid (PK)
- name: string
- path: geometry
- created_by: uuid (FK -> users.id)
- family_id: uuid (FK -> family_groups.id)
- is_public: boolean
- created_at: timestamp

#### route_places
- route_id: uuid (FK -> routes.id)
- place_id: uuid (FK -> places.id)
- order: integer

#### photos
- id: uuid (PK)
- place_id: uuid (FK -> places.id)
- url: string
- created_by: uuid (FK -> users.id)
- created_at: timestamp

### Indexes
- location index (GIST) on places
- path index (GIST) on routes
- compound index on family_members (group_id, user_id)

### Security Policies
- Row Level Security for all tables
- Public/private content filtering
- Family group membership validation