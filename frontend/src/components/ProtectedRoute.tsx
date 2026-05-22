import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import type { ReactNode } from "react";

// Wraps any route that requires authentication.
// If the user isn't logged in, they're sent to /login.
// The replace prop replaces the history entry so the back button
// doesn't send them back to the protected page.
interface Props {
  children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
