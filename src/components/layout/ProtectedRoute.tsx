import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

export const ProtectedRoute: React.FC<{ component: React.ComponentType<any> }> = ({ component: Component }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
};
