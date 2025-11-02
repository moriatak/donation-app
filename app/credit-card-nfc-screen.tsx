import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';
import { usePaymentContext } from '../context/PaymentContext';

// הגדרת טיפוס לנתוני כרטיס
interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv?: string;
  idNumber?: string;
}

// הגדרת טיפוס לפרמטרים של הדף
interface RouteParams {
  amount: string;
  [key: string]: string | string[];
}

export default function CreditCardNfcScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const config = MOCK_QR_CONFIG;
  
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const { setSensitiveCardData } = usePaymentContext();

  // בדיקה האם המכשיר תומך ב-NFC
  useEffect(() => {
    const checkNfc = async () => {
      try {
        
      } catch (error) {
        console.log('NFC error:', error);
        setIsNfcSupported(false);
      }
    };
    
    checkNfc();
    
    // ניקוי בעת סגירת הקומפוננטה
    return () => {
    };
  }, []);

  // איפוס מצב הטעינה בעת חזרה לעמוד
  useFocusEffect(
    useCallback(() => {
      return () => {
        setLoading(false);
        setIsScanning(false);
      };
    }, [])
  );

  // פונקציה להתחלת סריקת NFC
  const startNfcScan = async () => {
    try {
      setIsScanning(true);
      setScanError('');
      
      // הפעלת קורא ה-NFC
    
      // סימולציה של קריאת כרטיס - במציאות כאן תהיה הקריאה האמיתית של הכרטיס
      // קריאת APDU מהכרטיס
      setTimeout(() => {
        // סימולציה של מידע שהתקבל מהכרטיס
        const mockCardData: CardData = {
          cardNumber: '4580123412341234',
          cardHolder: 'ישראל ישראלי',
          expiry: '12/25',
          // בפועל ה-CVV לא מאוחסן בשבב ה-EMV ואינו נקרא באמצעות NFC
        };
        
        setCardData(mockCardData);
        setIsScanning(false);
        
        // שחרור הטכנולוגיה
      }, 2000);
      
    } catch (error) {
      console.log('Error during NFC scan:', error);
      setIsScanning(false);
      setScanError('אירעה שגיאה בקריאת הכרטיס. אנא נסה שנית.');
    }
  };

  const handleSubmit = async () => {
    if (!cardData) return;
    
    setLoading(true);
    
    // שמירת הנתונים הרגישים ב-Context
    setSensitiveCardData({
      cardNumber: cardData.cardNumber,
      cardHolder: cardData.cardHolder,
      expiry: cardData.expiry,
      // בקריאת NFC אין CVV, אך ייתכן שהשרת לא ידרוש אותו בתשלום NFC
      cvv: '',
      // אין ת"ז בכרטיס, אך ייתכן שנדרוש מהמשתמש להזין אותה ידנית
      idNumber: ''
    });
    
    // שליחה לשרת - במקרה אמיתי כאן יהיה קוד API לשרת
    try {
      // סימולציה של שליחת בקשה לשרת
      // const response = await fetch('https://api.example.com/process-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: params.amount,
      //     cardNumber: cardData.cardNumber,
      //     cardHolder: cardData.cardHolder,
      //     expiry: cardData.expiry,
      //     // נתונים נוספים שהשרת מצפה להם
      //   })
      // });
      // const result = await response.json();
      
      // אם התשלום הצליח
      setTimeout(() => {
        router.push({
          pathname: '/processing',
          params: { ...params, paymentMethod: 'nfc_card' }
        });
      }, 1000);
    } catch (error) {
      setScanError('שגיאה בביצוע התשלום. אנא נסה שנית.');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>תשלום בהצמדת כרטיס</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.amountBox, { backgroundColor: config.colors.primary }]}>
          <Text style={styles.amountLabel}>סכום לחיוב</Text>
          <Text style={styles.amount}>₪{params.amount}</Text>
        </View>
        
        <View style={styles.nfcSection}>
          <View style={styles.nfcIconContainer}>
            <Text style={styles.nfcIcon}>📱↔️💳</Text>
          </View>
          
          <Text style={styles.nfcInstructions}>
            אנא הצמד את כרטיס האשראי לגב המכשיר
          </Text>
          
          {!isNfcSupported && (
            <Text style={styles.errorText}>
              המכשיר שלך אינו תומך בקריאת כרטיסי אשראי באמצעות NFC
            </Text>
          )}
          
          {scanError ? (
            <Text style={styles.errorText}>{scanError}</Text>
          ) : null}
          
          {cardData && (
            <View style={styles.cardPreview}>
              <Text style={styles.cardPreviewTitle}>פרטי כרטיס שנקראו:</Text>
              <Text style={styles.cardDetail}>מספר: ••••{cardData.cardNumber.slice(-4)}</Text>
              <Text style={styles.cardDetail}>שם: {cardData.cardHolder}</Text>
              <Text style={styles.cardDetail}>תוקף: {cardData.expiry}</Text>
            </View>
          )}
        </View>
        
        {isNfcSupported && !cardData && !isScanning && (
          <TouchableOpacity
            style={[
              styles.scanButton,
              { backgroundColor: config.colors.secondary }
            ]}
            onPress={startNfcScan}
          >
            <Text style={styles.scanButtonText}>התחל סריקה</Text>
          </TouchableOpacity>
        )}
        
        {isScanning && (
          <View style={styles.scanningContainer}>
            <ActivityIndicator size="large" color={config.colors.primary} />
            <Text style={styles.scanningText}>סורק כרטיס...</Text>
          </View>
        )}
        
        {cardData && (
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
        )}
        
        <View style={styles.secureBox}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>
            פרטי הכרטיס מוצפנים ומאובטחים בתקן PCI-DSS
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.manualEntryLink}
          onPress={() => router.push({
            pathname: '/credit-card-manual',
            params: { ...params }
          })}
        >
          <Text style={[styles.manualEntryText, { color: config.colors.primary }]}>
            העדפה להזין את פרטי הכרטיס באופן ידני?
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
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
  backButton: { 
    padding: 12, 
    backgroundColor: '#f3f4f6', 
    borderRadius: 12 
  },
  backButtonText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  content: { 
    padding: 20,
    alignItems: 'center'
  },
  amountBox: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%'
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
  nfcIconContainer: {
    width: 150,
    height: 150,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 75,
  },
  nfcIcon: {
    fontSize: 40,
  },
  nfcSection: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  nfcImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain'
  },
  nfcInstructions: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  scanButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanningContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scanningText: {
    marginTop: 10,
    fontSize: 16,
  },
  cardPreview: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardPreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  cardDetail: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  submitButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: { 
    opacity: 0.5 
  },
  submitButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  secureBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
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
  manualEntryLink: {
    padding: 10,
  },
  manualEntryText: {
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  }
});