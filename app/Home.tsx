import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HebrewDate from '../components/HebrewDate';
import { MOCK_QR_CONFIG } from '../config/mockConfig';

export default function HomeScreen() {
  const router = useRouter();
  const config = MOCK_QR_CONFIG;

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={config.colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📱</Text>
        <HebrewDate config={config} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoSection}>
          {config.synagogue.logo_url && (
            <Image
              source={{ uri: config.synagogue.logo_url }}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.synagogueName, { color: config.colors.primary }]}>
            {config.synagogue.name}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.donationButton, { backgroundColor: config.colors.primary }]}
          onPress={() => router.push('/target-selection')}
          activeOpacity={0.8}
        >
          <Text style={styles.donationButtonText}>תרומה חדשה</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
});