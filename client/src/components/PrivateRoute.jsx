import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If not logged in, redirect to login page
  // 'replace' replaces history entry so back button doesn't return here
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the actual page
  return children;
};

export default PrivateRoute;