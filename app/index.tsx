import { useConfig } from '@/context/configContext';
import UserTrackingService from '@/services/UserTrackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, AppState, Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { config } = useConfig();

  useEffect(() => {
    const checkTokenAndLoadConfig = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          setTimeout(() => {
            router.replace('/Home');
          }, 1500);
        } else {
          setTimeout(() => {
            router.replace('/login');
          }, 1500);
        }
      } catch (error) {
        console.log('Error checking token:', error);
        router.replace('/login');
      }
    };
    
    checkTokenAndLoadConfig();
  }, [router]);

  useEffect(() => {
    // אתחול המעקב בהפעלת האפליקציה    
    UserTrackingService.initTracking();
    
    // האזנה לשינויים במצב האפליקציה (פעיל/רקע/לא פעיל)
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // האפליקציה חזרה למצב פעיל
        UserTrackingService.initTracking();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // האפליקציה עברה לרקע או נסגרה
        UserTrackingService.endSession();
      }
    });
    
    // ניקוי בעת הסרת הקומפוננטה
    return () => {
      appStateSubscription.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      {/* <Text style={styles.icon}>🕍</Text> */}
      <Image source={{ uri: 'https://tak.co.il/new/images/logo_splash.png' }} style={styles.methodIcon} />
      <Text style={[styles.title, { color: config.colors.primary }]}>
        מסופון תרומות
      </Text>
      <ActivityIndicator 
        size="large" 
        color={config.colors.secondary} 
        style={{ marginTop: 30 }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  methodIcon: {
    width: 300,
    height: 300,
  },
});