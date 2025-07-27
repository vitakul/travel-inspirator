import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import placesReducer from './slices/placesSlice'
import familyReducer from './slices/familySlice'
import routesReducer from './slices/routesSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    family: familyReducer,
    routes: routesReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setAuth'],
        ignoredPaths: ['auth.user', 'auth.session'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch