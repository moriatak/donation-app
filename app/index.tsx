import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MOCK_QR_CONFIG, SynagogueConfig } from '../config/mockConfig';

export default function SplashScreen() {
  const router = useRouter();
  const config = MOCK_QR_CONFIG;

  useEffect(() => {
    const checkTokenAndLoadConfig = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          // טוען את ההגדרות מה-storage
          const configString = await AsyncStorage.getItem('synagogueConfig');
          
          if (configString) {
            updateConfig(JSON.parse(configString), config);
            console.log('Loaded config from storage:', config);
          } else {
            console.log('No config found in storage, using default');
          }
          
          setTimeout(() => {
            router.replace('/Home');
          }, 1500);
        } else {
          setTimeout(() => {
            router.replace('/login');
          }, 1500);
        }
      } catch (error) {
        console.log('Error checking token or loading config:', error);
        router.replace('/login');
      }
    };
    
    checkTokenAndLoadConfig();
  }, [router]);

  const updateConfig = (settings: any, config: SynagogueConfig): void => {
    try {      
      if (settings.synagogue.name) {
        config.synagogue.name = settings.synagogue.name;
        console.log('Updated synagogue name to:', settings.synagogue.name);
      }
      if (settings.synagogue.logo_url) {
        config.synagogue.logo_url = settings.synagogue.logo_url;
        console.log('Updated synagogue logo_url to:', settings.synagogue.logo_url);

      }
      if (settings.settings.bit_option && settings.settings.bit_option == true) {
        config.settings.bit_option = true;
        console.log('Updated settings bitOption to:', true);
      } else {
        config.settings.bit_option = false;
        console.log('Updated settings bitOption to:', false);
      }
      
      if (settings.settings.companyId) {
        config.settings.companyId = settings.settings.companyId;
        console.log('Updated synagogue companyId to:', settings.settings.companyId);
        
      }
      if (settings.settings.compId) {
        config.settings.copmainingId = settings.settings.compId;
        console.log('Updated synagogue copmainingId to:', settings.settings.copmainingId);

      }
      if (settings.settings.compToken) {
        config.settings.copmainingToken = settings.settings.compToken;
        console.log('Updated synagogue compToken to:', settings.settings.compToken);

      }
    } catch (error) {
      console.log('Error updating config from response:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: MOCK_QR_CONFIG.colors.background }]}>
      <Text style={styles.icon}>🕍</Text>
      <Text style={[styles.title, { color: MOCK_QR_CONFIG.colors.primary }]}>
        מערכת תרומות
      </Text>
      <ActivityIndicator 
        size="large" 
        color={MOCK_QR_CONFIG.colors.secondary} 
        style={{ marginTop: 30 }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});