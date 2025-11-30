import { useConfig } from '@/context/configContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DonorAPI } from '../services/api';
import { Validators } from '../services/validators';

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const phoneInputRef = useRef<TextInput>(null);

  const handleContinue = async () => {
    const phoneError = Validators.phone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    
    setLoading(true);
    try {
      const result = await DonorAPI.sendVerificationCode(config, phone);

      if (result.success && result.sessionId) {
        // תורם קיים וקוד נשלח בהצלחה - מעבר למסך אימות
        router.push({
          pathname: '/code-verification',
          params: { 
            ...params, 
            phone,
            sessionId: result.sessionId 
          }
        });
      } else {
        // תורם חדש - מעבר להזנה ידנית והצגת מודל נעים
        router.push({
          pathname: '/details',
          params: { ...params, phone, isNewDonor: 'true', showNewDonorModal: 'true' }
        });
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בבדיקת המספר או בשליחת הקוד');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push({
      pathname: '/details',
      params: { ...params }
    });
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      phoneInputRef.current?.measure((fx, fy, width, height, px, py) => {
        scrollViewRef.current?.scrollTo({
          y: py - 150, // גלילה לשדה עם מרווח
          animated: true,
        });
      });
    }, 100);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.container, { backgroundColor: config.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: config.colors.primary }]}>אימות טלפון</Text>
          <View style={{ width: 80 }} />
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📱</Text>
          </View>
          
          <Text style={[styles.description, { color: config.colors.primary }]}>
            הזן מספר טלפון לזיהוי מהיר
          </Text>
          <Text style={styles.subdescription}>
            אם תרמת בעבר, נמלא את הפרטים עבורך
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: config.colors.primary }]}>
              מספר טלפון
            </Text>
            <TextInput
              ref={phoneInputRef}
              style={[
                styles.input,
                { borderColor: error ? '#ef4444' : config.colors.secondary }
              ]}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setError('');
              }}
              onFocus={handleInputFocus}
              placeholder="05X-XXX-XXXX"
              keyboardType="phone-pad"
              textAlign="right"
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={() => phoneInputRef.current?.blur()}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
          
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: config.colors.primary },
              loading && styles.disabled
            ]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueText}>
              {loading ? 'בודק...' : 'המשך לאימות'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: config.colors.primary }]}>
            להזנה ידנית
            </Text>
          </TouchableOpacity>
          
          {/* מרווח נוסף למטה כדי להבטיח גלילה טובה */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  content: { 
    padding: 20, 
    paddingTop: 60,
    flexGrow: 1 // מבטיח שהתוכן יתמלא ויאפשר גלילה
  },
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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: { opacity: 0.5 },
  continueText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  skipButton: { alignItems: 'center', padding: 15 },
  skipText: { fontSize: 16, textDecorationLine: 'underline' },
});