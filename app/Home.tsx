import { AuthGuard } from '@/context/AuthGuard';
import { useConfig } from '@/context/configContext';
import UserTrackingService from '@/services/UserTrackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HebrewDate from '../components/HebrewDate';

export default function HomeScreen() {
  const router = useRouter();
  const { config } = useConfig();
  const [logoError, setLogoError] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    forceUpdate: boolean;
    message: string;
    storeUrl: string;
  } | null>(null);

  const handlePhoneIconPress = () => {
    router.push('/gabbai-phone-verification');
  };

    useEffect(() => {
      // אתחול מעקב
      UserTrackingService.initTracking();
      
      // התחלת מעקב אחר ניתוק מרוחק ועדכון גרסה
      UserTrackingService.startDeviceMonitoring(
        async (reason) => {
          // בצע logout מיד
          const keysToRemove = ['token', 'synagogue_config'];
          await AsyncStorage.multiRemove(keysToRemove);
          
          await UserTrackingService.trackAction(
            config.settings.companyId, 
            config.settings.tokenApi, 
            'logout'
          );
          
          router.dismissAll();
          router.replace({
            pathname: '/login',
            params: {
              logoutMessage: reason || 'המכשיר נותק על ידי המנהל'
            }
          });          
        },
        async (deviceStatus) => {
          console.log('in deviceStatus', deviceStatus)
          // טיפול בעדכון גרסה
          const storeUrl = Platform.OS === 'ios' 
            ? deviceStatus.updateUrlIos || 'https://apps.apple.com/il/app/YOUR_APP_ID'
            : deviceStatus.updateUrlAndroid || 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE';
          
          setUpdateInfo({
            forceUpdate: deviceStatus.forceUpdate || (deviceStatus.dismissalCount || 0) >= 30,
            message: deviceStatus.updateMessage || 'גרסה חדשה זמינה',
            storeUrl: storeUrl
          });
          setShowUpdateModal(true);
        },
        300000 // בזמן פיתוח
        // 86400000 // 24 שעות במילישניות
      );


    return () => {
      UserTrackingService.stopLogoutMonitoring();
    };
  }, []);

  const UpdateModal = ({ 
    visible, 
    forceUpdate, 
    message, 
    storeUrl,
    onDismiss 
  }: { 
    visible: boolean;
    forceUpdate: boolean;
    message: string;
    storeUrl: string;
    onDismiss: () => void;
  }) => (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.updateModalOverlay}>
          <View style={styles.updateModalContent}>
            <View style={[styles.updateIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.updateIcon}>🔄</Text>
            </View>
            <Text style={styles.updateTitle}>
              {forceUpdate ? 'נדרש עדכון' : 'עדכון זמין'}
            </Text>
            <Text style={styles.updateMessage}>{message}</Text>
            
            <View style={styles.updateButtonsContainer}>
              <TouchableOpacity
                style={[styles.updateButton, styles.updateButtonPrimary, { backgroundColor: config.colors.primary }]}
                onPress={() => {
                  Linking.openURL(storeUrl);
                  if (!forceUpdate) {
                    setShowUpdateModal(false);
                  }
                }}
              >
                <Text style={styles.updateButtonText}>עדכן עכשיו</Text>
              </TouchableOpacity>
              
              {!forceUpdate && (
                <TouchableOpacity
                  style={[styles.updateButton, styles.updateButtonSecondary]}
                  onPress={async () => {
                    await UserTrackingService.incrementUpdateDismissal();
                    onDismiss();
                  }}
                >
                  <Text style={[styles.updateButtonTextSecondary, { color: config.colors.primary }]}>
                  עדכן בזמן אחר
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: config.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={config.colors.background} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePhoneIconPress}>
            {/* <Text style={styles.headerIcon}>📱</Text> */}
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
          <HebrewDate config={config} />
        </View>
        
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoSection}>
            {config.synagogue.logo_url && !logoError ? (
              <Image
                source={{ 
                  uri: config.synagogue.logo_url,
                  headers: {
                    'Accept': '*/*',
                    'User-Agent': 'Mozilla/5.0'
                  }
                }}
                style={styles.logo}
                resizeMode="contain"
                onError={(e) => {
                  console.log('שגיאה בלוגו:', e.nativeEvent.error);
                  setLogoError(true);
                }}
                onLoad={() => console.log('לוגו נטען')}
              />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>🕍</Text>
              </View>
            )}
            <Text style={[styles.synagogueName, { color: config.colors.primary }]}>
              {config.synagogue.name}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.donationButton, { backgroundColor: config.colors.primary }]}
            onPress={() => router.push('/target-selection')}
            // onPress={() => router.push('/ItemsScreen')}
            // onPress={() => router.push('/payment-method')}
            activeOpacity={0.8}
          >
            <Text style={styles.donationButtonText}>תרומה חדשה</Text>
            {/* <Text style={styles.donationButtonText}>התחל קנייה </Text> */}
          </TouchableOpacity>
        </ScrollView>

      </View>
      <UpdateModal
        visible={showUpdateModal}
        forceUpdate={updateInfo?.forceUpdate || false}
        message={updateInfo?.message || ''}
        storeUrl={updateInfo?.storeUrl || ''}
        onDismiss={() => setShowUpdateModal(false)}
      />
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerIcon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 450,
    height: 180,
    marginBottom: 40,
  },
  synagogueName: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  donationButton: {
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  donationButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  logoFallback: {
    width: 300,
    height: 120,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 15,
  },
  logoFallbackText: {
    fontSize: 60,
  },
  updateButtonsContainer: {
    width: '100%',
    gap: 10,
  },
  updateButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
  },
  updateButtonPrimary: {
    // backgroundColor מוגדר דינמית
  },
  updateButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updateButtonTextSecondary: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  updateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  updateIcon: {
    fontSize: 40,
  },
  updateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  updateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
});