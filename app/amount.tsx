import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';

export default function AmountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  
  const target = {
    id: params.targetId as string,
    name: params.targetName as string,
    icon: params.targetIcon as string
  };
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  
  const finalAmount = customAmount || selectedAmount;

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>בחירת סכום</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.targetBox, { borderColor: config.colors.secondary }]}>
          <Text style={styles.targetIcon}>{target.icon}</Text>
          <Text style={[styles.targetName, { color: config.colors.primary }]}>
            {target.name}
          </Text>
        </View>
        
        <View style={styles.grid}>
          {config.quick_amounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              onPress={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              style={[
                styles.amountButton,
                { borderColor: config.colors.secondary },
                selectedAmount === amount && !customAmount && {
                  backgroundColor: config.colors.primary
                }
              ]}
            >
              <Text style={[
                styles.amountText,
                { color: selectedAmount === amount && !customAmount ? 'white' : config.colors.primary }
              ]}>
                ₪{amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.customBox, { borderColor: config.colors.secondary }]}>
          <Text style={[styles.label, { color: config.colors.primary }]}>סכום אחר</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { borderColor: config.colors.secondary }]}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount(null);
              }}
              placeholder="הזן סכום"
              keyboardType="numeric"
              textAlign="right"
            />
            <Text style={styles.currency}>₪</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: config.colors.primary },
            !finalAmount && styles.disabled
          ]}
          onPress={() => router.push({
            pathname: '/phone-verification', 
            params: { ...params, amount: finalAmount?.toString() }
          })}
          disabled={!finalAmount}
        >
          <Text style={styles.continueText}>המשך</Text>
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
  targetBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  targetIcon: { fontSize: 40, marginBottom: 10 },
  targetName: { fontSize: 20, fontWeight: 'bold' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountButton: {
    width: '31%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountText: { fontSize: 22, fontWeight: 'bold' },
  customBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 10 },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: 'white',
    padding: 15,
    paddingRight: 50,
    fontSize: 20,
    borderWidth: 2,
    borderRadius: 10,
    textAlign: 'right',
  },
  currency: { position: 'absolute', right: 15, top: 15, fontSize: 20, color: '#9ca3af' },
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