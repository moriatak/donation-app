import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/Home');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: MOCK_QR_CONFIG.colors.background }]}>
      <Text style={styles.icon}>🕍</Text>
      <Text style={[styles.title, { color: MOCK_QR_CONFIG.colors.primary }]}>
        מערכת תרומות
      </Text>
      <ActivityIndicator 
        size="large" 
        color={MOCK_QR_CONFIG.colors.secondary} 
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