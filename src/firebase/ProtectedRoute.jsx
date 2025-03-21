import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirect to profile page if user is not logged in
    return <Navigate to="/profile" replace />;
  }

  return children;
} 