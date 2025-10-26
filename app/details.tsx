import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';
import { Validators } from '../services/validators';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  email: string;
  dedication: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  idNumber?: string;
  email?: string;
}

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  
  // בדיקה אם זה תורם מאומת
  const isVerified = params.isVerified === 'true';
  const isPhoneLocked = params.isPhoneLocked === 'true';
  
  const [formData, setFormData] = useState<FormData>({
    firstName: (params.donorFirstName as string) || '',
    lastName: (params.donorLastName as string) || '',
    phone: (params.phone as string) || '',
    idNumber: (params.donorId as string) || '',
    email: (params.donorEmail as string) || '',
    dedication: ''
  });
  const [errors, setErrors] = useState<Errors>({});
  
  const handleSubmit = () => {
    const newErrors: Errors = {
      firstName: Validators.firstName(formData.firstName),
      lastName: Validators.lastName(formData.lastName),
      phone: Validators.phone(formData.phone),
      idNumber: Validators.israeliId(formData.idNumber),
      email: Validators.email(formData.email)
    };
    
    const hasErrors = Object.values(newErrors).some(err => err);
    setErrors(newErrors);
    
    if (!hasErrors) {
      router.push({
        pathname: '/confirmation',
        params: { 
          ...params,
          donorFirstName: formData.firstName,
          donorLastName: formData.lastName,
          donorPhone: formData.phone,
          donorId: formData.idNumber,
          donorEmail: formData.email,
          donorDedication: formData.dedication
        }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>
          {isVerified ? 'אישור פרטים' : 'פרטי תורם'}
        </Text>
        <View style={{ width: 80 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {isVerified && (
          <View style={[styles.verifiedBanner, { backgroundColor: '#dcfce7', borderColor: '#16a34a' }]}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <View style={styles.verifiedTextContainer}>
              <Text style={styles.verifiedTitle}>אנחנו כבר מכירים:)</Text>
              <Text style={styles.verifiedSubtitle}>בדוק את הפרטים ועדכן במידת הצורך</Text>
            </View>
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            שם פרטי <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.firstName ? '#ef4444' : config.colors.secondary },
              isVerified && { backgroundColor: '#f0fdf4' }
            ]}
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholder="הזן שם פרטי"
            textAlign="right"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            שם משפחה <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.lastName ? '#ef4444' : config.colors.secondary },
              isVerified && { backgroundColor: '#f0fdf4' }
            ]}
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholder="הזן שם משפחה"
            textAlign="right"
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            טלפון <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.phone ? '#ef4444' : config.colors.secondary },
              isPhoneLocked && { backgroundColor: '#f3f4f6' }
            ]}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="05X-XXX-XXXX"
            keyboardType="phone-pad"
            textAlign="right"
            editable={!isPhoneLocked}
          />
          {isPhoneLocked && (
            <Text style={styles.lockedText}>🔒 מספר מאומת</Text>
          )}
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            תעודת זהות {config.settings.require_id && <Text style={styles.required}>*</Text>}
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.idNumber ? '#ef4444' : config.colors.secondary },
              isVerified && formData.idNumber && { backgroundColor: '#f0fdf4' }
            ]}
            value={formData.idNumber}
            onChangeText={(text) => setFormData({ ...formData, idNumber: text })}
            placeholder="9 ספרות"
            keyboardType="numeric"
            maxLength={9}
            textAlign="right"
          />
          {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            אימייל (אופציונלי)
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.email ? '#ef4444' : config.colors.secondary },
              isVerified && formData.email && { backgroundColor: '#f0fdf4' }
            ]}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="right"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            הקדשה (אופציונלי)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { borderColor: config.colors.secondary }
            ]}
            value={formData.dedication}
            onChangeText={(text) => setFormData({ ...formData, dedication: text })}
            placeholder="לזכר / לעילוי נשמת..."
            multiline
            numberOfLines={3}
            textAlign="right"
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: config.colors.primary }]}
          onPress={handleSubmit}
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
  verifiedBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    gap: 12,
  },
  verifiedIcon: {
    fontSize: 32,
    color: '#16a34a',
  },
  verifiedTextContainer: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803d',
    textAlign: 'right',
    marginBottom: 4,
  },
  verifiedSubtitle: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'right',
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  required: { color: '#dc2626' },
  input: {
    backgroundColor: 'white',
    padding: 16,
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  lockedText: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 5,
    textAlign: 'right',
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
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});