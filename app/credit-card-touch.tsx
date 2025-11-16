import { NextActionApp } from '@/config/mockConfig';
import { AuthGuard } from '@/context/AuthGuard';
import { useConfig } from '@/context/configContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { TaktzivitAPI } from '../services/api';

export default function CreditCardTouchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // אנימציה פועמת לאייקון הכרטיס
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // טיימאאוט של 30 שניות
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

    return () => clearTimeout(timeoutId);
  }, []);

  const processPayment = async () => {
    try {

      const paymentResponse = await TaktzivitAPI.processPayment(
        config,
        { 
          amount: params.amount as string, 
          phone: params.donorPhone as string,
          donorFirstName: params.donorFirstName as string,
          donorLastName: params.donorLastName as string,
          donorEmail: params.donorEmail as string || '',  // מטפל במקרה שהשדה לא קיים
          donorPhone: params.donorPhone as string,
          targetItemId: params.targetItemId as string,
          targetName: params.targetName as string,
          paymentMethod: params.paymentMethod as string,
          nexAction: params.nextAction as NextActionApp,
          cardData: null // אין צורך בפרטי כרטיס במעבר לקורא
        }
      );
      
      if (paymentResponse.success) {
        router.replace({
          pathname: '/success',
          params: {
            ...params,
            transactionId: paymentResponse.transactionId,
            idDoc: paymentResponse.idDoc
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
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: config.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: config.colors.primary }]}></Text>
          <View style={{ width: 80 }} />
        </View>

        <View style={styles.content}>
          {/* הצגת סכום */}
          <View style={[styles.amountBox, { backgroundColor: config.colors.primary }]}>
            <Text style={styles.amountLabel}>סכום לחיוב</Text>
            <Text style={styles.amount}>₪{params.amount}</Text>
          </View>

          {/* אזור מרכזי - אייקון כרטיס והוראות */}
          <View style={styles.instructionsContainer}>
            <Animated.View 
              style={[
                styles.cardIconContainer,
                { 
                  backgroundColor: `${config.colors.primary}15`,
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Text style={styles.cardIcon}>💳</Text>
            </Animated.View>

            <Text style={[styles.statusText, { color: config.colors.primary }]}>
            הצמד כרטיס לקורא
            </Text>
            <Text style={styles.instructionText}>
            קרב את הכרטיס לקורא ההמתנה לאישור
            </Text>
          </View>

          {/* הערות חשובות */}
          <View style={styles.notesContainer}>
            <View style={styles.noteItem}>
              <Text style={styles.noteIcon}>ℹ️</Text>
              <Text style={styles.noteText}>
                ודא שהכרטיס במצב תקין ופעיל
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteIcon}>⏱️</Text>
              <Text style={styles.noteText}>
                העיבוד עשוי לקחת מספר שניות
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteIcon}>🔒</Text>
              <Text style={styles.noteText}>
                התשלום מאובטח ומוצפן
              </Text>
            </View>
          </View>
        </View>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  amountBox: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  amountLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  cardIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardIcon: {
    fontSize: 80,
  },
  statusText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  spinner: {
    marginBottom: 15,
  },
  processingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  notesContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 15,
    padding: 20,
    gap: 15,
  },
  noteItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  noteIcon: {
    fontSize: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'right',
  },
});