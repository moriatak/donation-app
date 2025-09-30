import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';

export default function ProcessingScreen() {
  const config = MOCK_QR_CONFIG;

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.content}>
        <ActivityIndicator 
          size="large" 
          color={config.colors.primary}
          style={styles.spinner}
        />
        <Text style={[styles.title, { color: config.colors.primary }]}>
          מעבד תשלום...
        </Text>
        <Text style={styles.subtitle}>
          אנא המתן, אל תסגור את האפליקציה
        </Text>
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
    padding: 30,
  },
  spinner: {
    marginBottom: 30,
    transform: [{ scale: 1.5 }],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
});