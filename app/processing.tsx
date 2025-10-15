import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';
import { TaktzivitAPI } from '../services/api';

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    try {
      const intentResponse = await TaktzivitAPI.createIntent({
        target: params.targetId as string,
        amount: params.amount as string,
        name: params.donorName as string,
        phone: params.donorPhone as string,
        idNumber: params.donorId as string,
        email: params.donorEmail as string,
        dedication: params.donorDedication as string
      });
      
      const paymentResponse = await TaktzivitAPI.processPayment(
        intentResponse.intentId,
        { 
          amount: params.amount as string, 
          phone: params.donorPhone as string 
        }
      );
      
      if (paymentResponse.success) {
        router.replace({
          pathname: '/success',
          params: {
            ...params,
            transactionId: paymentResponse.transactionId
          }
        });
      }
    } catch (error) {
      router.replace({
        pathname: '/error',
        params: {
          ...params,
          errorMessage: error instanceof Error ? error.message : 'שגיאה לא ידועה'
        }
      });
    }
  };

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