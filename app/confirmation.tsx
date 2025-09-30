import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';
import { TaktzivitAPI } from '../services/api';

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const target = {
    id: params.targetId as string,
    name: params.targetName as string,
    icon: params.targetIcon as string
  };
  
  const amount = params.amount as string;
  const donorDetails = {
    name: params.donorName as string,
    phone: params.donorPhone as string,
    idNumber: params.donorId as string,
    email: params.donorEmail as string,
    dedication: params.donorDedication as string
  };
  
  const handlePayment = async () => {
    setLoading(true);
    
    // מעבר למסך טעינה
    router.push('/processing');
    
    try {
      const intentResponse = await TaktzivitAPI.createIntent({
        target: target.id,
        amount,
        ...donorDetails
      });
      
      const paymentResponse = await TaktzivitAPI.processPayment(
        intentResponse.intentId,
        { amount, phone: donorDetails.phone }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/Home')} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>✕ ביטול</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>אישור תשלום</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryBox}>
        <View style={styles.summaryHeader}>
        <Text style={[styles.targetLabel, { color: '#6b7280' }]}>עבור:</Text>
        <Text style={styles.summaryIcon}>{target.icon}</Text>
        <Text style={[styles.summaryTarget, { color: config.colors.primary }]}>
            {target.name}
        </Text>
        <Text style={[styles.summaryAmount, { color: config.colors.secondary }]}>
            ₪{amount}
        </Text>
        </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: config.colors.primary }]}>שם:</Text>
              <Text style={styles.detailValue}>{donorDetails.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: config.colors.primary }]}>טלפון:</Text>
              <Text style={styles.detailValue}>{donorDetails.phone}</Text>
            </View>
            
            {donorDetails.idNumber && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: config.colors.primary }]}>ת״ז:</Text>
                <Text style={styles.detailValue}>******{donorDetails.idNumber.slice(-3)}</Text>
              </View>
            )}
            
            {donorDetails.email && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: config.colors.primary }]}>אימייל:</Text>
                <Text style={styles.detailValue}>{donorDetails.email}</Text>
              </View>
            )}
            
            {donorDetails.dedication && (
              <View style={styles.dedicationSection}>
                <Text style={[styles.detailLabel, { color: config.colors.primary }]}>הקדשה:</Text>
                <View style={styles.dedicationBox}>
                  <Text style={styles.dedicationText}>{donorDetails.dedication}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.termsBox}>
          <View style={styles.termsRow}>
            <Switch
              value={agreedToTerms}
              onValueChange={setAgreedToTerms}
              trackColor={{ false: '#d1d5db', true: config.colors.secondary }}
              thumbColor={agreedToTerms ? config.colors.primary : '#f4f3f4'}
            />
            <Text style={styles.termsText}>
              אני מאשר/ת את <Text style={[styles.termsBold, { color: config.colors.primary }]}>תנאי התרומה</Text>
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.back()}
          >
            <Text style={styles.editButtonText}>✎ עריכה</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.payButton,
              (!agreedToTerms || loading) && styles.payButtonDisabled
            ]}
            onPress={handlePayment}
            disabled={!agreedToTerms || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.payButtonIcon}>✓</Text>
                <Text style={styles.payButtonText}>תרום עכשיו</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  cancelButton: { padding: 12, backgroundColor: '#fee2e2', borderRadius: 12 },
  cancelButtonText: { fontSize: 16, color: '#dc2626', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold' },
  content: { padding: 20 },
  summaryBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: { alignItems: 'center', marginBottom: 20 },
  summaryIcon: { fontSize: 50, marginBottom: 10 },
  summaryTarget: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  summaryAmount: { fontSize: 56, fontWeight: 'bold' },
  divider: { height: 2, backgroundColor: '#e5e7eb', marginVertical: 20 },
  detailsSection: { gap: 15 },
  detailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  detailLabel: { fontSize: 16, fontWeight: '600' },
  detailValue: { fontSize: 16, color: '#374151' },
  dedicationSection: { paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  dedicationBox: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 10, marginTop: 10 },
  dedicationText: { fontSize: 14, textAlign: 'right' },
  termsBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  termsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  termsText: { flex: 1, fontSize: 14, textAlign: 'right' },
  termsBold: { fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row-reverse', gap: 10 },
  editButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  editButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  payButton: {
    flex: 2,
    backgroundColor: '#16a34a',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  payButtonDisabled: { opacity: 0.5 },
  payButtonIcon: { fontSize: 20, color: 'white' },
  payButtonText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  targetLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
});