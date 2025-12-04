import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest, UserRole } from '@/types';
import * as authApi from '@/api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Restore session from localStorage on mount
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          // Try to get fresh user data
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch {
            // If API call fails, use stored user data
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear invalid session
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Login user (with mock support for development)
   */
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      // MOCK LOGIN FOR DEVELOPMENT - Remove in production
      const mockUsers: Record<string, User> = {
        'provider@demo.com': {
          id: '1',
          email: 'provider@demo.com',
          firstName: 'Demo',
          lastName: 'Provider',
          role: 'provider',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        'patient@demo.com': {
          id: '2',
          email: 'patient@demo.com',
          firstName: 'Demo',
          lastName: 'Patient',
          role: 'patient',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        'admin@demo.com': {
          id: '3',
          email: 'admin@demo.com',
          firstName: 'Demo',
          lastName: 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const mockUser = mockUsers[data.email];
      if (mockUser && data.password === 'Demo123!') {
        localStorage.setItem('accessToken', 'mock-token');
        localStorage.setItem('refreshToken', 'mock-refresh-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }
      // END MOCK LOGIN

      const response = await authApi.login(data);
      
      // Store tokens
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      
      // Store tokens
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user data (local state)
   */
  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Check if user has specific role(s)
   */
  const hasRole = useCallback((role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

