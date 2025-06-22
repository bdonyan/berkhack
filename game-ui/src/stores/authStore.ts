import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  eloRating: number;
  totalSessions: number;
  bestScore: number;
  averageScore: number;
  joinDate: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUserStats: (stats: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call - replace with actual authentication
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data - in real app, this would come from your backend
          const mockUser: User = {
            id: '1',
            email,
            name: email.split('@')[0], // Use email prefix as name
            eloRating: 1200,
            totalSessions: 0,
            bestScore: 0,
            averageScore: 0,
            joinDate: new Date().toISOString(),
          };
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: 'Login failed. Please check your credentials.', 
            isLoading: false 
          });
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call - replace with actual registration
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data
          const mockUser: User = {
            id: '1',
            email,
            name,
            eloRating: 1000, // Starting rating
            totalSessions: 0,
            bestScore: 0,
            averageScore: 0,
            joinDate: new Date().toISOString(),
          };
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: 'Signup failed. Please try again.', 
            isLoading: false 
          });
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUserStats: (stats: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...stats } });
        }
      },
    }),
    {
      name: 'eloquence-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 