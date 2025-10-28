import { useConfig } from '@/context/configContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TaktzivitAPI } from '../services/api';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  
  const [countdown, setCountdown] = useState(config.settings.auto_return_seconds);
  
  const target = {
    id: params.targetId as string,
    name: params.targetName as string,
    icon: params.targetIcon as string
  };
  
  const amount = params.amount as string;
  const idDoc = params.idDoc as string;
  const donorDetails = {
    phone: params.donorPhone as string,
    email: params.donorEmail as string
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer); // עצור את הטיימר כשמגיעים ל-0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // הוסף useEffect נפרד שמטפל בניווט כאשר countdown מגיע ל-0
  useEffect(() => {
    if (countdown === 0) {
      router.replace('/Home');
    }
  }, [countdown, router]);
  
  const sendReceipt = async (method: 'sms' | 'email') => {
    const contact = method === 'sms' ? donorDetails.phone : donorDetails.email;
    
    if (!contact) {
      Alert.alert('שגיאה', `לא קיים ${method === 'sms' ? 'מספר טלפון' : 'אימייל'}`);
      return;
    }
    
    try {
      await TaktzivitAPI.sendReceipt(idDoc, method, contact);
      Alert.alert('הצלחה', `קבלה נשלחה ב-${method === 'sms' ? 'SMS' : 'אימייל'}`);
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאה בשליחת הקבלה');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f0fdf4' }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        
        <Text style={styles.title}>
          {amount && parseFloat(amount as string) > 100 ? 'תודה רבה על תרומתך הנדיבה!' : 'תודה רבה!'}
        </Text>
        <Text style={styles.subtitle}>התשלום בוצע בהצלחה</Text>
        
        <View style={styles.summaryBox}>
          <Text style={styles.targetIcon}>{target.icon}</Text>
          <Text style={styles.targetName}>נתרם ל{target.name}</Text>
          <Text style={[styles.amount, { color: config.colors.secondary }]}>
            ₪{amount}
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>מספר אישור</Text>
          <Text style={[styles.transactionId, { color: config.colors.primary }]}>
            {idDoc}
          </Text>
        </View>
        
        <View style={styles.receiptBox}>
          <Text style={[styles.receiptTitle, { color: config.colors.primary }]}>
            שלח קבלה
          </Text>
          <View style={styles.receiptButtons}>
            <TouchableOpacity
              style={[styles.receiptButton, styles.smsButton]}
              onPress={() => sendReceipt('sms')}
              disabled={!donorDetails.phone}
            >
              <Text style={styles.receiptIcon}>💬</Text>
              <Text style={styles.receiptButtonText}>SMS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.receiptButton, styles.emailButton]}
              onPress={() => sendReceipt('email')}
              disabled={!donorDetails.email}
            >
              <Text style={styles.receiptIcon}>📧</Text>
              <Text style={styles.receiptButtonText}>אימייל</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.newDonationButton, { backgroundColor: config.colors.primary }]}
          onPress={() => router.replace('/Home')}
        >
          <Text style={styles.newDonationButtonText}>תרומה נוספת</Text>
        </TouchableOpacity>
        
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownIcon}>⏱</Text>
          <Text style={styles.countdownText}>חזרה אוטומטית בעוד {countdown} שניות</Text>
        </View>
      </ScrollView>
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
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  successIconText: {
    fontSize: 70,
    color: 'white',
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 30,
  },
  summaryBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  targetIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  targetName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 10,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  divider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    width: '100%',
    marginVertical: 20,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  receiptBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  receiptButtons: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  receiptButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  smsButton: {
    backgroundColor: '#3b82f6',
  },
  emailButton: {
    backgroundColor: '#22c55e',
  },
  receiptIcon: {
    fontSize: 20,
  },
  receiptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  newDonationButton: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newDonationButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  countdownContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  countdownIcon: {
    fontSize: 20,
  },
  countdownText: {
    fontSize: 16,
    color: '#6b7280',
  },
});