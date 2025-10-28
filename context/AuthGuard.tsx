import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // אם המשתמש מאומת, נראה את התוכן, אחרת useAuth יעביר אותומטית למסך התחברות
  return isAuthenticated ? <>{children}</> : null;
};