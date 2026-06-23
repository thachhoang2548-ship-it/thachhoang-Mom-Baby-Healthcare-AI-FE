import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthController((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
