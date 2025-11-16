import { AuthGuard } from '@/context/AuthGuard';
import { useConfig } from '@/context/configContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TargetSelectionScreen() {
  const router = useRouter();
  const { config } = useConfig();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const handleTargetPress = (target: any) => {
    setSelectedTarget(target.lastId);
    // המתנה קצרה כדי להראות את האנימציה
    setTimeout(() => {
      router.push({
        pathname: '/amount',
        params: { 
          targetId: target.lastId,
          targetItemId: target.itemId,
          targetName: target.name,
          targetIcon: target.icon
        }
      });
    }, 200);
  };

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: config.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: config.colors.primary }]}>
              ← חזור
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: config.colors.primary }]}>
            בחר יעד לתרומה
          </Text>
          <View style={{ width: 80 }} />
        </View>
        
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {config.donation_targets.map(target => (
              <TouchableOpacity
                key={target.lastId}
                style={[
                  styles.targetButton,
                  { borderColor: config.colors.secondary },
                  selectedTarget === target.lastId && {
                    backgroundColor: config.colors.primary,
                    borderColor: config.colors.primary,
                  }
                ]}
                onPress={() => handleTargetPress(target)}
                activeOpacity={0.7}
              >
                <Text style={styles.targetIcon}>{target.icon}</Text>
                <Text style={[
                  styles.targetName,
                  { color: selectedTarget === target.lastId ? 'white' : config.colors.primary }
                ]}>
                  {target.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
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
  content: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  targetButton: {
    width: '48%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  targetIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  targetName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});