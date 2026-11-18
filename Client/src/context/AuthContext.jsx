
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { authApi } from "../lib/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session using the HTTP-only cookie.
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const response = await authApi.me();

        if (isMounted) {
          setUser(response.user);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }

        // A missing or expired session is expected.
        if (error.status !== 401) {
          console.error(
            "Failed to restore authentication session:",
            error.message
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login and update authenticated user.
  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);

    setUser(response.user);

    return response.user;
  }, []);

  // Register and update authenticated user.
  const register = useCallback(async (data) => {
    const response = await authApi.register(data);

    setUser(response.user);

    return response.user;
  }, []);

  // Logout through the backend to clear the HTTP-only cookie.
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  // Update user data locally after a successful profile update.
  const updateUser = useCallback((patch) => {
    setUser((previousUser) => {
      if (!previousUser) return previousUser;

      return {
        ...previousUser,
        ...patch,
      };
    });
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}
