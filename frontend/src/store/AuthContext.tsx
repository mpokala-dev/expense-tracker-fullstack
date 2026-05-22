import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthState, AuthResult, User } from "../types/index";

// Auth context provides the logged-in user and token to the whole app.
// Components call useAuth() instead of reading localStorage directly —
// this keeps storage concerns in one place and makes testing easier.

interface AuthContextValue extends AuthState {
  login: (result: AuthResult) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitialState(): AuthState {
  try {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      return {
        token,
        user: JSON.parse(userJson) as User,
        isAuthenticated: true,
      };
    }
  } catch {
    // Corrupt storage — start fresh
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  return { token: null, user: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitialState);

  const login = useCallback((result: AuthResult) => {
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setState({
      token: result.token,
      user: result.user,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({ token: null, user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — throws if used outside AuthProvider,
// which catches wiring mistakes at dev time.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
