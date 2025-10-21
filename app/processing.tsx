import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';
import { usePaymentContext } from '../context/PaymentContext';
import { TaktzivitAPI } from '../services/api';

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  const { sensitiveCardData, setSensitiveCardData } = usePaymentContext();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace({
        pathname: '/error',
        params: {
          ...params,
          errorMessage: 'זמן העיבוד פג, אנא נסה שנית'
        }
      });
    }, 30000); // 30 שניות טיימאאוט
    
    processPayment();
    
    // ניקוי המידע הרגיש לאחר השימוש
    return () => {
      clearTimeout(timeoutId)
      setSensitiveCardData(null);
    };
  }, []);

  const processPayment = async () => {
    try {
      if (!sensitiveCardData) {
        throw new Error('פרטי כרטיס האשראי חסרים');
      }

      const paymentResponse = await TaktzivitAPI.processPayment(
        { 
          amount: params.amount as string, 
          phone: params.donorPhone as string,
          donorName: params.donorName as string,
          donorEmail: params.donorEmail as string || '',  // מטפל במקרה שהשדה לא קיים
          donorPhone: params.donorPhone as string,
          targetId: params.targetId as string,
          targetName: params.targetName as string,
          paymentMethod: params.paymentMethod as string,
          cardData: sensitiveCardData
          
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