import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole, Permission } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string, _password: string, role: UserRole) => {
        set({ isLoading: true });

        try {
          // Simulate API call - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Mock user data - replace with actual API response
          const user: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name: email.split('@')[0],
            role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              ...userData,
              updatedAt: new Date(),
            },
          });
        }
      },

      hasPermission: (permission: Permission) => {
        const { user } = get();
        if (!user) return false;
        const userPermissions = ROLE_PERMISSIONS[user.role];
        return userPermissions.includes(permission);
      },

      hasAnyPermission: (permissions: Permission[]) => {
        const { user } = get();
        if (!user) return false;
        const userPermissions = ROLE_PERMISSIONS[user.role];
        return permissions.some(p => userPermissions.includes(p));
      },

      hasAllPermissions: (permissions: Permission[]) => {
        const { user } = get();
        if (!user) return false;
        const userPermissions = ROLE_PERMISSIONS[user.role];
        return permissions.every(p => userPermissions.includes(p));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
