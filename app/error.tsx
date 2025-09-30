import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';

export default function ErrorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  
  const errorMessage = params.errorMessage as string || 'אירעה שגיאה לא צפויה';

  return (
    <View style={[styles.container, { backgroundColor: '#fef2f2' }]}>
      <View style={styles.content}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>✕</Text>
        </View>
        
        <Text style={styles.title}>אופס! משהו השתבש</Text>
        <Text style={styles.message}>{errorMessage}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: config.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>נסה שוב</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/Home')}
          >
            <Text style={styles.homeButtonText}>חזרה לבית</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  errorIconText: {
    fontSize: 70,
    color: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  retryButton: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  homeButton: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  homeButtonText: {
    color: '#374151',
    fontSize: 20,
    fontWeight: 'bold',
  },
});