import { DonorAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG, SynagogueConfig } from '../config/mockConfig';

export default function LoginScreen() {
  const router = useRouter();
  const config = MOCK_QR_CONFIG;
  
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadSavedToken();
  }, []);
  
  const loadSavedToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) setToken(savedToken);
    } catch (error) {
      console.log('Failed to load saved token', error);
    }
  };
  
  const saveToken = async (tokenValue: string) => {
    try {
      await AsyncStorage.setItem('token', tokenValue);
    } catch (error) {
      console.log('Failed to save token', error);
    }
  };

  const validateToken = (tokenValue: string) => {
    if (tokenValue.trim() === '') {
      setError('טוקן הוא שדה חובה');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = async (tokenFromQR: string = '') => {
    // אם קיבלנו טוקן מ-QR נשתמש בו, אחרת נשתמש בטוקן מה-state
    const tokenToUse = tokenFromQR || token;
    
    if (!validateToken(tokenToUse)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Save token
      await saveToken(tokenToUse);
      
      // Get settings with token
      const settings = await DonorAPI.getSettings(tokenToUse);
      
      if (settings.success && settings.settings) {
        updateConfigFromResponse(settings.settings, config);
        
        setShowSuccessModal(true);
  
        // עבור למסך הבית אחרי 1.5 שניות
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push({
            pathname: '/Home',
            params: {}
          });
        }, 1500);
      } else {
        Alert.alert('שגיאת התחברות', settings.message || 'טוקן לא תקין');
        setError('טוקן לא תקין');
      }
    } catch (error: any) {
      Alert.alert('שגיאת התחברות', error.message || 'אירעה שגיאה בהתחברות');
      setError('אירעה שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status === 'granted') {
      setShowQRScanner(true);
      setScanned(false);
    } else {
      Alert.alert('אין הרשאה', 'יש לאפשר גישה למצלמה כדי לסרוק QR');
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setShowQRScanner(false);
    console.log('QR data:', data);
    
    try {
      // נניח שה-QR מכיל את הטוקן (או JSON עם token)
      let tokenFromQR = data;
      
      // אם זה JSON, נחלץ את הטוקן
      try {
        const qrData = JSON.parse(data);
        if (qrData.token) {
          tokenFromQR = qrData.token;
        }
      } catch {
        // אם זה לא JSON, נשתמש בערך כמו שהוא
      }
      console.log('Token from QR:', tokenFromQR);
      // התחברות אוטומטית עם הטוקן מה-QR
      handleLogin(tokenFromQR);
    } catch (error) {
      console.log('QR scan error:', error);
      Alert.alert('שגיאה', 'קוד QR לא תקין');
    }
  };

  const updateConfigFromResponse = (settings: any, config: SynagogueConfig): SynagogueConfig => {
    try {      
      if (settings.donationAppName) {
        config.synagogue.name = settings.donationAppName;
        console.log('Updated synagogue name to:', settings.donationAppName);
      }
      if (settings.logo) {
        config.synagogue.logo_url = settings.logo;
        console.log('Updated synagogue logo_url to:', settings.logo);

      }
      if (settings.bitOption && settings.bitOption == true) {
        config.settings.bit_option = true;
        console.log('Updated settings bitOption to:', true);
      } else {
        config.settings.bit_option = false;
        console.log('Updated settings bitOption to:', false);
      }
      
      if (settings.companyId) {
        config.settings.companyId = settings.companyId;
        console.log('Updated synagogue companyId to:', settings.companyId);
        
      }
      if (settings.compId) {
        config.settings.copmainingId = settings.compId;
        console.log('Updated synagogue copmainingId to:', settings.copmainingId);

      }
      if (settings.compToken) {
        config.settings.copmainingToken = settings.compToken;
        console.log('Updated synagogue compToken to:', settings.compToken);

      }

      AsyncStorage.setItem('synagogueConfig', JSON.stringify(config))
        .catch(err => console.log('Failed to save updated config', err));
      
      return config;
    } catch (error) {
      console.log('Error updating config from response:', error);
      return config;
    }
  };

  // הצגת הודעת הצלחת טעינת הגדרות
  const SuccessModal = ({ visible, onContinue }: { visible: boolean; onContinue: () => void }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.successModalOverlay}>
        <View style={styles.successModalContent}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>התחברות הצליחה!</Text>
          <Text style={styles.successMessage}>ברוך הבא למערכת</Text>
          <TouchableOpacity
            style={[styles.successButton, { backgroundColor: config.colors.primary }]}
            onPress={onContinue}
          >
            <Text style={styles.successButtonText}>המשך</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: config.colors.primary }]}>התחברות למערכת</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>
        
        <Text style={[styles.description, { color: config.colors.primary }]}>
          ברוכים הבאים
        </Text>
        <Text style={styles.subdescription}>
          סרקו קוד QR או הזינו טוקן להתחברות
        </Text>

        {/* כפתור סריקת QR */}
        <TouchableOpacity
          style={[styles.qrButton, { borderColor: config.colors.primary }]}
          onPress={handleQRScan}
          disabled={loading}
        >
          <Text style={styles.qrIcon}>📷</Text>
          <Text style={[styles.qrButtonText, { color: config.colors.primary }]}>
            סרוק קוד QR
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>או הזן טוקן</Text>
          <View style={styles.dividerLine} />
        </View>
        
        {/* שדה טוקן */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: config.colors.primary }]}>
            טוקן
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: error ? '#ef4444' : config.colors.secondary }
            ]}
            value={token}
            onChangeText={(text: string) => {
              setToken(text);
              setError('');
            }}
            placeholder="הזן טוקן"
            textAlign="right"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        
        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: config.colors.primary },
            loading && styles.disabled
          ]}
          onPress={() => handleLogin()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginText}>התחבר</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <View style={styles.qrScannerContainer}>
          <View style={styles.qrScannerHeader}>
            <Text style={styles.qrScannerTitle}>סרוק קוד QR</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRScanner(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {hasPermission === null ? (
            <View style={styles.qrScannerContent}>
              <Text style={styles.permissionText}>מבקש הרשאת מצלמה...</Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.qrScannerContent}>
              <Text style={styles.permissionText}>אין גישה למצלמה</Text>
            </View>
          ) : (
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            >
              <View style={styles.qrFrame}>
                <View style={[styles.qrCorner, styles.topLeft]} />
                <View style={[styles.qrCorner, styles.topRight]} />
                <View style={[styles.qrCorner, styles.bottomLeft]} />
                <View style={[styles.qrCorner, styles.bottomRight]} />
              </View>
              <Text style={styles.qrInstructions}>
                מקם את קוד ה-QR במרכז המסגרת
              </Text>
            </CameraView>
          )}
        </View>
      </Modal>
      <SuccessModal 
        visible={showSuccessModal} 
        onContinue={() => {
          setShowSuccessModal(false);
          router.push({
            pathname: '/Home',
            params: {}
          });
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  title: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  content: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 40 
  },
  iconContainer: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  icon: { 
    fontSize: 80 
  },
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
    marginBottom: 30,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  qrIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  qrButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#6b7280',
    fontSize: 14,
  },
  inputGroup: { 
    marginBottom: 20 
  },
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
  loginButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: { 
    opacity: 0.5 
  },
  loginText: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  qrScannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  qrScannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  qrScannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  qrScannerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#4ade80',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  qrInstructions: {
    position: 'absolute',
    bottom: 100,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
  },
  // הוסף את זה בסוף ה-StyleSheet
successModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
successModalContent: {
  backgroundColor: 'white',
  borderRadius: 20,
  padding: 30,
  alignItems: 'center',
  width: '80%',
  maxWidth: 350,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 10,
},
successIconContainer: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#10b981',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
},
successIcon: {
  fontSize: 50,
  color: 'white',
  fontWeight: 'bold',
},
successTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#1f2937',
  marginBottom: 10,
  textAlign: 'center',
},
successMessage: {
  fontSize: 16,
  color: '#6b7280',
  marginBottom: 25,
  textAlign: 'center',
},
successButton: {
  paddingVertical: 15,
  paddingHorizontal: 40,
  borderRadius: 12,
  width: '100%',
},
successButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
},
});