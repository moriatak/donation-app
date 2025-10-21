import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';
import { usePaymentContext } from '../context/PaymentContext';

export default function CreditCardManualScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    idNumber: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { setSensitiveCardData } = usePaymentContext();

  // איפוס מצב הטעינה בעת חזרה לעמוד 
  useFocusEffect(
    useCallback(() => {
      return () => {
        // כאשר יוצאים מהעמוד, נאפס את הלודינג כדי שבעת החזרה הכפתור יהיה לחיץ
        setLoading(false);
      };
    }, [])
  );


  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    const newErrors: any = {};
    
    // מספר כרטיס
    const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length !== 16) {
      newErrors.cardNumber = 'מספר כרטיס חייב להכיל 16 ספרות';
    }
    
    // שם בעל הכרטיס
    if (cardData.cardHolder.length < 2) {
      newErrors.cardHolder = 'הזן שם בעל הכרטיס';
    }
    
    // תוקף
    const expiryParts = cardData.expiry.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiry = 'פורמט לא תקין (MM/YY)';
    } else {
      const month = parseInt(expiryParts[0]);
      if (month < 1 || month > 12) {
        newErrors.expiry = 'חודש לא תקין';
      }
    }
    
    // CVV
    if (cardData.cvv.length !== 3) {
      newErrors.cvv = 'CVV חייב להכיל 3 ספרות';
    }
    
    // ת"ז
    if (cardData.idNumber.length !== 9) {
      newErrors.idNumber = 'ת״ז חייבת להכיל 9 ספרות';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateCard()) return;
    
    setLoading(true);
    // שמירת הנתונים הרגישים ב-Context
    setSensitiveCardData({
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      cardHolder: cardData.cardHolder,
      expiry: cardData.expiry,
      cvv: cardData.cvv,
      idNumber: cardData.idNumber
    });
    
    // סימולציה: עיבוד תשלום
    setTimeout(() => {
      router.push({
        pathname: '/processing',
        params: { ...params, paymentMethod: 'credit_card' }
      });
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>פרטי כרטיס אשראי</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.amountBox, { backgroundColor: config.colors.primary }]}>
          <Text style={styles.amountLabel}>סכום לחיוב</Text>
          <Text style={styles.amount}>₪{params.amount}</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            מספר כרטיס <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.cardNumber ? '#ef4444' : config.colors.secondary }
            ]}
            value={cardData.cardNumber}
            onChangeText={(text) => setCardData({ 
              ...cardData, 
              cardNumber: formatCardNumber(text) 
            })}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
          />
          {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            שם בעל הכרטיס <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.cardHolder ? '#ef4444' : config.colors.secondary }
            ]}
            value={cardData.cardHolder}
            onChangeText={(text) => setCardData({ ...cardData, cardHolder: text })}
            placeholder="כפי שמופיע על הכרטיס"
            autoCapitalize="words"
          />
          {errors.cardHolder && <Text style={styles.errorText}>{errors.cardHolder}</Text>}
        </View>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: config.colors.primary }]}>
              CVV <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: errors.cvv ? '#ef4444' : config.colors.secondary }
              ]}
              value={cardData.cvv}
              onChangeText={(text) => setCardData({ 
                ...cardData, 
                cvv: text.replace(/\D/g, '').substring(0, 3)
              })}
              placeholder="123"
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
            {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
          </View>
          
          <View style={{ width: 15 }} />
          
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: config.colors.primary }]}>
              תוקף <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: errors.expiry ? '#ef4444' : config.colors.secondary }
              ]}
              value={cardData.expiry}
              onChangeText={(text) => setCardData({ 
                ...cardData, 
                expiry: formatExpiry(text)
              })}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
            />
            {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            ת״ז בעל הכרטיס <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: errors.idNumber ? '#ef4444' : config.colors.secondary }
            ]}
            value={cardData.idNumber}
            onChangeText={(text) => setCardData({ 
              ...cardData, 
              idNumber: text.replace(/\D/g, '').substring(0, 9)
            })}
            placeholder="9 ספרות"
            keyboardType="numeric"
            maxLength={9}
          />
          {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
        </View>
        
        {/* <View style={styles.secureBox}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>
            פרטי הכרטיס מוצפנים ומאובטחים בתקן PCI-DSS
          </Text>
        </View> */}
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: config.colors.primary },
            loading && styles.disabled
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {'אשר תשלום'}
            {/* {loading ? 'מעבד...' : 'אשר תשלום'} */}
          </Text>
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
  amountBox: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  amountLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row-reverse',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  secureBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  secureIcon: {
    fontSize: 20,
  },
  secureText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    textAlign: 'right',
  },
  submitButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: { opacity: 0.5 },
  submitButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});