import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // בדיקה האם קיים טוקן
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      // אם אין טוקן, המשתמש לא מחובר
      setIsAuthenticated(!!token);
    } catch (error) {
      console.log('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה להתנתקות
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsAuthenticated(false);
      router.replace('/login');
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // הפנייה אוטומטית לדף התחברות אם אין אימות
  useEffect(() => {
    if (isAuthenticated === false && !isLoading) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading, checkAuth, logout };
};