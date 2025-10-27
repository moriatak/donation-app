import { TaktzivitAPI } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useId, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MOCK_QR_CONFIG } from '../config/mockConfig';

export default function BitPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [docToken, setDocToken] = useState('');
  const [idDoc, setIdDoc] = useState('');
  const [polling, setPolling] = useState(false); 
  const [pollingCount, setPollingCount] = useState(0); 
  const reactId = useId();
  const transactionId = `TRX_${Date.now()}_${reactId.replace(/:/g, '')}`;
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    processPayment();
  }, []);

  useEffect(() => {
    if (!polling || !docToken) return;
  
    const intervalId = setInterval(() => {
      checkPaymentStatus();
      
      setPollingCount(prev => prev + 1);
    }, 3000);
  
    return () => clearInterval(intervalId);
  }, [polling, docToken]);
  
  // 👇 useEffect נפרד שעוקב אחרי pollingCount
  useEffect(() => {
    // Timeout אחרי 10 דקות (200 בדיקות x 3 שניות)
    if (pollingCount >= 200 && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      setPolling(false);
      
      router.replace({
        pathname: '/error',
        params: {
          ...params,
          errorMessage: 'זמן ההמתנה לתשלום הסתיים. אנא נסה שוב.',
        },
      });
    }
  }, [pollingCount]);


  const processPayment = async () => {
    try {
      const paymentResponse = await TaktzivitAPI.processPayment({
        amount: params.amount as string,
        phone: params.donorPhone as string,
        donorFirstName: params.donorFirstName as string,
        donorLastName: params.donorLastName as string,
        donorEmail: (params.donorEmail as string) || '',
        donorPhone: params.donorPhone as string,
        targetId: params.targetId as string,
        targetName: params.targetName as string,
        paymentMethod: params.paymentMethod as string,
        transactionId: transactionId as string
      });

      if (paymentResponse.success && paymentResponse.paymentUrl) {
        setPaymentUrl(paymentResponse.paymentUrl);
        setDocToken(paymentResponse.docToken);
        setIdDoc(paymentResponse.idDoc);
        setLoading(false);
        setPolling(true); 
      } else {
        throw new Error('לא התקבל קישור תשלום מהשרת');
      }
    } catch (error) {
      setLoading(false);
      router.replace({
        pathname: '/error',
        params: {
          ...params,
          errorMessage: error instanceof Error ? error.message : 'שגיאה לא ידועה',
        },
      });
    }
  };

  const checkPaymentStatus = async () => {
    try {
      if (!polling || hasNavigatedRef.current) return;
      const formData = new URLSearchParams();
      formData.append('docToken', docToken);
      formData.append('apiBit', '123456789bit'); // 👈 שנה למפתח האמיתי שלך
  
      // הדפסת הבקשה ללוג לפני שליחה
      console.log('======== PAYMENT REQUEST ========');
      console.log('URL: https://tak.co.il/cashier/bit/bitConfirm.php');
      console.log('METHOD: POST');
      console.log('HEADERS: Content-Type: application/json');
      console.log('BODY (object):', Object.fromEntries(formData)); 
      console.log('================================');

      const response = await fetch('https://tak.co.il/cashier/bit/bitConfirm.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
  
      const status = await response.json();

      if (status.success && !hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        setPolling(false);
        
        router.replace({
          pathname: '/success',
          params: {
            ...params,
            idDoc: idDoc,
          },
        });
      }
    } catch (error) {
      console.log('Error checking payment status:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: config.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={config.colors.primary} />
          <Text style={[styles.loadingText, { color: config.colors.primary }]}>
            מכין תשלום בביט...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>תשלום בביט</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={[styles.amountBox, { backgroundColor: config.colors.primary }]}>
        <Text style={styles.amountLabel}>סכום לתשלום</Text>
        <Text style={styles.amount}>₪{params.amount}</Text>
      </View>

      {paymentUrl ? (
        <WebView
          source={{ uri: paymentUrl }}
          style={styles.webview}
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          // בלחיצה על איקס בתוך החלק של ביט, יחזיר אחורה לבחירת אמצעי תשלום
          onNavigationStateChange={(navState) => {
            // עדכן את ההיסטוריה
            setNavigationHistory(prev => [...prev, navState.url]);
            // בדוק אם המשתמש ביטל
            if (navState.canGoBack === false && navigationHistory.length > 1) {
              // המשתמש חזר לדף הראשון - סימן לביטול
              if (!hasNavigatedRef.current) {
                hasNavigatedRef.current = true;
                setPolling(false);
                router.back();
              }
            }
            // בדוק URL ספציפיים של ביטול
            if (navState.url.includes('cancel') || 
                navState.url.includes('abort') ||
                navState.url === 'about:blank') {
              if (!hasNavigatedRef.current) {
                hasNavigatedRef.current = true;
                setPolling(false);
                router.back();
              }
            }
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color={config.colors.primary} />
              <Text style={[styles.loadingText, { color: config.colors.primary }]}>
                טוען עמוד תשלום...
              </Text>
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          // 👇 הוסף את זה כדי לחסום פתיחת אפליקציות חיצוניות
          onShouldStartLoadWithRequest={(request) => {
          // אפשר רק URL-ים שמתחילים ב-http/https
           if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
                return true;
            }
            // חסום כל deep link (bit://, intent://, וכו')
            return false;
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView error:', nativeEvent);
            router.replace({
              pathname: '/error',
              params: {
                ...params,
                errorMessage: 'שגיאה בטעינת עמוד התשלום',
              },
            });
          }}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>לא התקבל קישור תשלום</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: config.colors.primary }]}
            onPress={() => {
              setLoading(true);
              processPayment();
            }}
          >
            <Text style={styles.retryButtonText}>נסה שוב</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
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
  },
  backButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  amountBox: {
    padding: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});