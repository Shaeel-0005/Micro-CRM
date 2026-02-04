import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = authAPI.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}