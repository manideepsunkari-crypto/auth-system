import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Wraps routes that require authentication
// Optionally accepts a requiredRole to restrict by role
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
