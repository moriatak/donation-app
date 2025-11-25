import { NextActionApp } from '@/config/mockConfig';
import { AuthGuard } from '@/context/AuthGuard';
import { useConfig } from '@/context/configContext';
import { getAvailablePaymentMethods, navigateToPaymentMethod } from '@/utils/paymentUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // איפוס המצב בכל פעם שהמסך מקבל פוקוס
      setIsProcessing(false);
      setSelectedMethod(null);

      return () => {
        // פונקציה שתרוץ כשעוזבים את המסך (אופציונלי)
      };
    }, [])
  );

  const handleMethodSelect = (nextAction: NextActionApp, type: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setSelectedMethod(type);
    navigateToPaymentMethod(router, nextAction, type, params);
  };

  const availablePaymentMethods = getAvailablePaymentMethods(
    config.settings.paymentOptions, 
    params.isMonthly as string
  );

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: config.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: config.colors.primary }]}>אמצעי תשלום</Text>
          <View style={{ width: 80 }} />
        </View>
        
        <ScrollView contentContainerStyle={styles.content}>
          {(params.isMonthly === 'true' ? null : <Text style={[styles.subtitle, { color: config.colors.primary }]}>
            בחר את אמצעי התשלום המועדף עליך
          </Text>)}
          
          <View style={styles.methodsContainer}>
            {availablePaymentMethods.map((method) => (
              <TouchableOpacity
                key={method.type}
                style={[
                  styles.methodButton,
                  { borderColor: config.colors.secondary },
                  selectedMethod === method.type && {
                    backgroundColor: '#10b981',
                    borderColor: '#10b981',
                    borderWidth: 3
                  },
                  isProcessing && method.type !== selectedMethod && { opacity: 0.5 }
                ]}
                onPress={() => handleMethodSelect(method.NextActionApp, method.type)}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <View style={styles.methodContent}>
                  <Image source={{ uri: method.icon }} style={styles.methodIcon} />
                  <View style={styles.methodTextContainer}>
                    <Text style={[
                      styles.methodName,
                      { color: selectedMethod === method.type ? 'white' : config.colors.primary }
                    ]}>
                      {method.name}
                    </Text>
                    <Text style={[
                      styles.methodDescription,
                      { color: selectedMethod === method.type ? 'rgba(255,255,255,0.9)' : '#6b7280' }
                    ]}>
                      {method.description}
                    </Text>
                  </View>
                  {selectedMethod === method.type && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  backButton: { padding: 12, backgroundColor: '#f3f4f6', borderRadius: 12 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { padding: 20 },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  methodsContainer: {
    gap: 15,
    marginBottom: 30,
  },
  methodButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  methodContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 15,
  },
  methodIcon: {
    width: 50,
    height: 50,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    textAlign: 'right',
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  continueButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: { backgroundColor: '#d1d5db', opacity: 0.5 },
  continueText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});