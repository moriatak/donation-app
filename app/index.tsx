import { useConfig } from '@/context/configContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

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
        console.log('Error checking token or loading config:', error);
        router.replace('/login');
      }
    };
    
    checkTokenAndLoadConfig();
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <Text style={styles.icon}>🕍</Text>
      <Text style={[styles.title, { color: config.colors.primary }]}>
        מערכת תרומות
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
});