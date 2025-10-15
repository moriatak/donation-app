import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG } from '../config/mockConfig';

export default function BitPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const config = MOCK_QR_CONFIG;
  const [loading, setLoading] = useState(true);
  const [bitUrl, setBitUrl] = useState('');

  useEffect(() => {
    generateBitPaymentUrl();
  }, []);

  const generateBitPaymentUrl = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // URL לדוגמה - בפרודקשן זה יהיה קישור אמיתי מהשרת
    const mockBitUrl = `https://bit.app.link/payment?amount=${params.amount}&phone=${params.donorPhone}`;
    setBitUrl(mockBitUrl);
    setLoading(false);
  };

  const handleNavigationStateChange = (navState: any) => {
    if (navState.url.includes('success')) {
      router.replace({
        pathname: '/success',
        params: {
          ...params,
          transactionId: 'BIT' + Date.now()
        }
      });
    } else if (navState.url.includes('cancel') || navState.url.includes('error')) {
      router.replace({
        pathname: '/error',
        params: {
          ...params,
          errorMessage: 'התשלום בוטל או נכשל'
        }
      });
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>תשלום בביט</Text>
        <View style={{ width: 80 }} />
        </View>

        <View style={[styles.amountBox, { backgroundColor: config.colors.primary }]}>
        <Text style={styles.amountLabel}>סכום לתשלום</Text>
        <Text style={styles.amount}>₪{params.amount}</Text>
        </View>
      
      {/* <WebView
        source={{ uri: bitUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webviewLoading}>
            <ActivityIndicator size="large" color={config.colors.primary} />
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      /> */}
      
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
    footer: {
      padding: 20,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
  });
