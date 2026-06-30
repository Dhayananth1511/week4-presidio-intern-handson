import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { type ReactNode } from "react";

/**
 * ProtectedRoute Component
 * ---
 * This is a "Wrapper" component. It sits in front of private pages.
 * If the user is logged in, it lets them through to the children.
 * If not, it kicks them back to the login page.
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  // If we are still checking the cookie, show nothing yet
  if (loading) return null;

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
