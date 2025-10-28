import { useConfig } from '@/context/configContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PaymentMethod = 'bit' | 'credit-tap' | 'credit-manual';

export default function PaymentMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const paymentMethods = [
    ...(config.settings?.bit_option ? [{
      id: 'bit' as PaymentMethod,
      name: 'ביט',
      icon: '💳',
      description: 'תשלום מהיר דרך אפליקציית ביט',
      color: '#0099FF'
    }] : []),
    {
      id: 'credit-tap' as PaymentMethod,
      name: 'אשראי בטאץ׳',
      icon: '📱',
      description: 'הצמד כרטיס אשראי לקורא',
      color: '#8B5CF6'
    },
    {
      id: 'credit-manual' as PaymentMethod,
      name: 'אשראי הקלדה',
      icon: '💳',
      description: 'הזנת פרטי כרטיס אשראי ידנית',
      color: '#16a34a'
    }
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (!selectedMethod) return;
    
    if (selectedMethod === 'bit') {
      router.push({
        pathname: '/bit-payment',
        params: { ...params, paymentMethod: 'bit' }
      });
    } else if (selectedMethod === 'credit-manual') {
      router.push({
        pathname: '/credit-card-manual',
        params: { ...params }
      });
    } else if (selectedMethod === 'credit-tap') {
      // בטאץ' - ישירות לעיבוד
      router.push({
        pathname: '/processing',
        params: { ...params, paymentMethod: 'credit-tap' }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>אמצעי תשלום</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.subtitle, { color: config.colors.primary }]}>
          בחר את אמצעי התשלום המועדף עליך
        </Text>
        
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                { borderColor: config.colors.secondary },
                selectedMethod === method.id && {
                  backgroundColor: method.color,
                  borderColor: method.color,
                  borderWidth: 3
                }
              ]}
              onPress={() => handleMethodSelect(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.methodContent}>
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <View style={styles.methodTextContainer}>
                  <Text style={[
                    styles.methodName,
                    { color: selectedMethod === method.id ? 'white' : config.colors.primary }
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={[
                    styles.methodDescription,
                    { color: selectedMethod === method.id ? 'rgba(255,255,255,0.9)' : '#6b7280' }
                  ]}>
                    {method.description}
                  </Text>
                </View>
                {selectedMethod === method.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: config.colors.primary },
            !selectedMethod && styles.disabled
          ]}
          onPress={handleContinue}
          disabled={!selectedMethod}
        >
          <Text style={styles.continueText}>המשך לאישור</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    fontSize: 40,
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