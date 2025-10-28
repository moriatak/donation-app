import { useConfig } from '@/context/configContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GabbaiCodeVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  
  const phone = params.phone as string;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
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
    setError('');
    
    try {
      // בדיקה לקוד 123456
      if (codeString === '123456') {
        router.push('/admin-settings');
      } else {
        setError('קוד שגוי, אנא נסה שנית');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setError('אירעה שגיאה באימות הקוד');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    Alert.alert('קוד נשלח', 'קוד אימות חדש נשלח למספר הטלפון');
  };

  // הסרת קוד מיסוך מספר הטלפון

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
          <Text style={styles.icon}>🔐</Text>
        </View>
        
        <Text style={[styles.description, { color: config.colors.primary }]}>
          הזן את הקוד שנשלח אליך
        </Text>
        <Text style={[styles.subdescription, { color: config.colors.secondary }]}>
          קוד האימות נשלח למספר הטלפון שלך
        </Text>
        
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref: TextInput | null) => {
                inputRefs.current[index] = ref;
              }}              
              style={[
                styles.codeInput,
                { borderColor: config.colors.secondary },
                digit && { borderColor: config.colors.primary, borderWidth: 2 },
                error && !digit && { borderColor: '#ef4444' }
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
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
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
        
        <Text style={styles.hint}>
          💡 הקוד הנכון הוא 123456
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
  subdescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
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
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginVertical: 10,
    textAlign: 'center',
  },
  resendContainer: {
    marginTop: 10,
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
  hint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});