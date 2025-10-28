import { useConfig } from '@/context/configContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GABBAI_PHONE = "0585727870";

export default function GabbaiPhoneVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!phone || phone.length !== 10) {
      setError('יש להזין מספר טלפון תקין (10 ספרות)');
      return;
    }

    if (!phone.startsWith('05')) {
      setError('מספר טלפון חייב להתחיל ב-05');
      return;
    }
    
    if (phone === GABBAI_PHONE) {
      router.push({
        pathname: '/gabbai-code-verification',
        params: { ...params, phone }
      });
    } else {
      setError('אין לך הרשאה לגשת למערכת');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>כניסה לגבאי</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👋</Text>
        </View>
        
        <Text style={[styles.description, { color: config.colors.primary }]}>
          ברוך הבא למערכת גבאים 
        </Text>
        <Text style={styles.subdescription}>
          אנא הזן את מספר הטלפון שלך לכניסה למערכת
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            מספר טלפון
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: error ? '#ef4444' : config.colors.secondary }
            ]}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setError('');
            }}
            placeholder="05X-XXX-XXXX"
            keyboardType="phone-pad"
            textAlign="right"
            maxLength={10}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
        
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: config.colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>המשך לאימות</Text>
        </TouchableOpacity>
      </View>
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
  content: { flex: 1, padding: 20, paddingTop: 60 },
  iconContainer: { alignItems: 'center', marginBottom: 30 },
  icon: { fontSize: 80 },
  description: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subdescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: { marginBottom: 30 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: 'white',
    padding: 18,
    fontSize: 20,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
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
  continueText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});