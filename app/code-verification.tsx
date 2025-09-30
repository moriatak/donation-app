import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';
import { DonorAPI } from '../services/api';

export default function CodeVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  
  const phone = params.phone as string;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // מעבר אוטומטי לתיבה הבאה
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // אימות אוטומטי כשהקוד מלא
    if (newCode.every(digit => digit) && newCode.join('').length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (codeString: string) => {
    setLoading(true);
    try {
      const result = await DonorAPI.verifyCode(phone, codeString);
      if (result.success && result.donorData) {
        // קוד נכון - מעבר למסך פרטים עם הנתונים
        router.replace({
          pathname: '/details',
          params: {
            ...params,
            phone: result.donorData.phone,
            donorName: result.donorData.name,
            donorId: result.donorData.idNumber,
            donorEmail: result.donorData.email,
            isPhoneLocked: 'true',
            isVerified: 'true'  // ✅ דגל שהתורם אומת
          }
        });
      } else {
        // קוד שגוי
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        if (newAttempts >= 3) {
          Alert.alert(
            'ניסיונות אזלו',
            'הגעת למספר הניסיונות המקסימלי. נעבור להזנה ידנית.',
            [
              {
                text: 'אישור',
                onPress: () => router.replace({
                  pathname: '/details',
                  params: { ...params, phone, isNewDonor: 'false' }
                })
              }
            ]
          );
        } else {
          Alert.alert('קוד שגוי', `נותרו ${3 - newAttempts} ניסיונות`);
        }
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה באימות הקוד');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    try {
      await DonorAPI.sendVerificationCode(phone);
      Alert.alert('קוד נשלח', 'קוד אימות חדש נשלח למספר הטלפון');
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בשליחת הקוד');
    }
  };

  const handleManualEntry = () => {
    router.replace({
      pathname: '/details',
      params: { ...params, phone, isNewDonor: 'false' }
    });
  };

  const maskedPhone = phone.slice(0, 3) + '-XXX-X' + phone.slice(-3);

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>אימות קוד</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✉️</Text>
        </View>
        
        <Text style={[styles.description, { color: config.colors.primary }]}>
          שלחנו קוד אימות ל:
        </Text>
        <Text style={[styles.phone, { color: config.colors.secondary }]}>
          {maskedPhone}
        </Text>
        
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[
                styles.codeInput,
                { borderColor: config.colors.secondary },
                digit && { borderColor: config.colors.primary, borderWidth: 2 }
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
              editable={!loading}
            />
          ))}
        </View>
        
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendText, { color: config.colors.primary }]}>
                שלח שוב
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>
              שלח שוב בעוד {countdown} שניות
            </Text>
          )}
        </View>
        
        <TouchableOpacity onPress={handleManualEntry} style={styles.manualButton}>
          <Text style={[styles.manualText, { color: config.colors.primary }]}>
            להזנה ידנית
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>
          💡 בסימולציה: הקוד הנכון הוא 123456
        </Text>
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
  content: { flex: 1, padding: 20, paddingTop: 60, alignItems: 'center' },
  iconContainer: { marginBottom: 30 },
  icon: { fontSize: 80 },
  description: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  phone: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 30,
  },
  codeInput: {
    width: 50,
    height: 60,
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resendContainer: {
    marginBottom: 20,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  countdownText: {
    fontSize: 16,
    color: '#6b7280',
  },
  manualButton: {
    padding: 15,
    marginBottom: 30,
  },
  manualText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  hint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});