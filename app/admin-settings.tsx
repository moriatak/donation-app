import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import InfoAlertModal from '@/components/InfoAlertModal';
import SuccessModal from '@/components/SuccessModal';
import { AuthGuard } from '@/context/AuthGuard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import IconSelector from '../components/IconSelector';
import { DonationTarget, SynagogueConfig } from '../config/mockConfig';
import { useConfig } from '../context/configContext';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { config, updateConfig } = useConfig();
  const [editConfig, setEditConfig] = useState<SynagogueConfig>(config);
  // מוסיפים סטייט לניהול מצב המודאל
  const [iconSelectorVisible, setIconSelectorVisible] = useState(false);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [targetToDeleteIndex, setTargetToDeleteIndex] = useState<number | null>(null);
  const [infoAlertVisible, setInfoAlertVisible] = useState<boolean>(false);
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string }>({ 
    title: '', 
    message: '' 
  });
  const [quickAmountsText, setQuickAmountsText] = useState(
    editConfig.quick_amounts.join(', ')
  );
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);

  const handleSaveConfig = async () => {
    try {
      await updateConfig(editConfig);
  
      setSuccessModalVisible(true);
    } catch (error) {
      console.error('Error saving config:', error);
      // אפשר להוסיף הצגת הודעת שגיאה למשתמש
    }
  };

  const handleAddTarget = () => {
    const newTarget: DonationTarget = {
      lastId: `target_${Date.now()}`,
      itemId: '',
      name: '',
      icon: '💰'
    };
    setEditConfig({
      ...editConfig,
      donation_targets: [...editConfig.donation_targets, newTarget]
    });
  };

  const handleRemoveTarget = (index: number) => {
    if (editConfig.donation_targets.length <= 1) {
    // במקום להשתמש ב-Alert, הצג את המודאל המותאם אישית
    setAlertInfo({
      title: 'שים לב',
      message: 'חייב להיות לפחות יעד תרומה אחד במערכת'
    });
    setInfoAlertVisible(true);
    return;
  }
    
    setTargetToDeleteIndex(index);
    setDeleteModalVisible(true);
  };

  const handleTargetChange = (index: number, field: keyof DonationTarget, value: string) => {
    const newTargets = [...editConfig.donation_targets];
    newTargets[index] = { ...newTargets[index], [field]: value };
    setEditConfig({
      ...editConfig,
      donation_targets: newTargets
    });
  };

  // פונקציה לטיפול בלחיצה על אייקון
const handleIconPress = (index: number): void => {
  setSelectedTargetIndex(index);
  setIconSelectorVisible(true);
};

// פונקציה לבחירת אייקון
const handleIconSelect = (icon: string): void => {
  if (selectedTargetIndex !== null) {
    handleTargetChange(selectedTargetIndex, 'icon', icon);
  }
};
// פונקציה לסגירת מודאל ההתראה
const closeInfoAlert = (): void => {
  setInfoAlertVisible(false);
};

// פונקציה חדשה לאישור המחיקה
const confirmDeleteTarget = (): void => {
  if (targetToDeleteIndex !== null) {
    const newTargets = editConfig.donation_targets.filter((_, i) => i !== targetToDeleteIndex);
    setEditConfig({
      ...editConfig,
      donation_targets: newTargets
    });
    
    // סגור את המודאל לאחר המחיקה
    setDeleteModalVisible(false);
    setTargetToDeleteIndex(null);
  }
};

// הפונקציה שתופעל כשלוחצים על הכפתור במודאל
const handleSuccessModalClose = () => {
  setSuccessModalVisible(false);
  router.push('/Home');
};

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: config.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={config.colors.primary} />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: config.colors.primary }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/Home')}
          >
            <Text style={styles.backButtonText}>← חזור</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>הגדרות מערכת</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* פרטי בית כנסת */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🕍</Text>
              <Text style={[styles.cardTitle, { color: config.colors.primary }]}>
                פרטי בית הכנסת
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>שם בית הכנסת</Text>
              <TextInput
                style={styles.textInput}
                value={editConfig.synagogue.name}
                onChangeText={(text) => setEditConfig({
                  ...editConfig,
                  synagogue: { ...editConfig.synagogue, name: text }
                })}
                placeholder="הזן שם בית כנסת"
                placeholderTextColor="#999"
                textAlign="right"
              />
            </View>
            
            {config.settings.showNameTerminal ? <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>שם מסוף</Text>
              <TextInput
                style={styles.textInput}
                value={editConfig.settings.terminalName}
                onChangeText={(text) => setEditConfig({
                  ...editConfig,
                  settings: { ...editConfig.settings, terminalName: text }
                })}
                placeholder="שם מסוף"
                placeholderTextColor="#999"
                textAlign="right"
              />
            </View>: null}
            {/* <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>כתובת לוגו (URL)</Text>
              <TextInput
                style={styles.textInput}
                value={editConfig.synagogue.logo_url}
                onChangeText={(text) => setEditConfig({
                  ...editConfig,
                  synagogue: { ...editConfig.synagogue, logo_url: text }
                })}
                placeholder="https://..."
                placeholderTextColor="#999"
                textAlign="right"
              />
            </View> */}
          </View>

          {/* יעדי תרומה */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🎯</Text>
              <Text style={[styles.cardTitle, { color: config.colors.primary }]}>
                יעדי תרומה
              </Text>
            </View>
            
            <Text style={styles.cardDescription}>
              הגדר את היעדים השונים שהתורמים יוכלו לבחור
            </Text>

            {editConfig.donation_targets.map((target, index) => (
              <View key={target.lastId} style={styles.targetRow}>
                <View style={styles.targetInputs}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleIconPress(index)}
                  >
                    <Text style={styles.iconText}>{target.icon}</Text>
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.targetNameInput}
                    value={target.name}
                    onChangeText={(text) => handleTargetChange(index, 'name', text)}
                    placeholder="שם היעד"
                    placeholderTextColor="#999"
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity
                  style={styles.removeTargetButton}
                  onPress={() => handleRemoveTarget(index)}
                >
                  <Text style={styles.removeTargetText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: config.colors.secondary }]}
              onPress={handleAddTarget}
            >
              <Text style={styles.addButtonText}>+ הוסף יעד חדש</Text>
            </TouchableOpacity>
          </View>

          {/* סכומים מהירים */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>💰</Text>
              <Text style={[styles.cardTitle, { color: config.colors.primary }]}>
                סכומים מהירים
              </Text>
            </View>
            
            <Text style={styles.cardDescription}>
              הגדר סכומים מומלצים (הפרד בפסיק)
            </Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.textInput}
                value={quickAmountsText}
                onChangeText={(text) => {
                  // עדכן את הטקסט מיד - זה מאפשר להקליד פסיקים
                  setQuickAmountsText(text);
                  
                  // נסה לפרסר ולעדכן את המערך
                  const numbers = text
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s !== '')
                    .map(s => parseInt(s))
                    .filter(n => !isNaN(n));
                  
                  // תמיד עדכן את editConfig, גם אם המערך ריק
                  setEditConfig({
                    ...editConfig,
                    quick_amounts: numbers
                  });
                }}
                placeholder="18, 36, 54, 100, 180"
                placeholderTextColor="#999"
                keyboardType="numbers-and-punctuation"
                textAlign="right"
              />
            </View>

            {/* תצוגה מקדימה */}
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>תצוגה מקדימה:</Text>
              <View style={styles.previewAmounts}>
                {editConfig.quick_amounts.map((amount, index) => (
                  <View key={index} style={[styles.previewChip, { backgroundColor: config.colors.secondary }]}>
                    <Text style={styles.previewChipText}>₪{amount}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* הגדרות זמנים */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⏱️</Text>
              <Text style={[styles.cardTitle, { color: config.colors.primary }]}>
                הגדרות זמנים
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                זמן חזרה אוטומטי למסך הבית (שניות)
              </Text>
              <TextInput
                style={styles.textInput}
                value={editConfig.settings.auto_return_seconds.toString()}
                onChangeText={(text) => setEditConfig({
                  ...editConfig,
                  settings: { ...editConfig.settings, auto_return_seconds: parseInt(text) || 60 }
                })}
                placeholder="60"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                זמן המתנה מקסימלי ללא פעילות (שניות)
              </Text>
              <TextInput
                style={styles.textInput}
                value={editConfig.settings.idle_timeout_seconds.toString()}
                onChangeText={(text) => setEditConfig({
                  ...editConfig,
                  settings: { ...editConfig.settings, idle_timeout_seconds: parseInt(text) || 120 }
                })}
                placeholder="120"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                textAlign="right"
              />
            </View>

            {/* <View style={styles.switchRow}>
              <Switch
                value={editConfig.settings.require_id}
                onValueChange={(value) => setEditConfig({
                  ...editConfig,
                  settings: { ...editConfig.settings, require_id: value }
                })}
                trackColor={{ false: '#d1d5db', true: config.colors.secondary }}
                thumbColor={editConfig.settings.require_id ? config.colors.primary : '#f3f4f6'}
              />
              <Text style={styles.switchLabel}>דרוש תעודת זהות לתרומה</Text>
            </View> */}
          </View>

          {/* כפתור שמירה */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: config.colors.primary }]}
            onPress={handleSaveConfig}
          >
            <Text style={styles.saveButtonText}>שמור את כל ההגדרות</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
        
        {/* מודאל בחירת אייקון ליעד תרומה */}
        <IconSelector 
          visible={iconSelectorVisible}
          onSelect={handleIconSelect}
          onClose={() => setIconSelectorVisible(false)}
        />

        {/* מודאל התראה */}
        <InfoAlertModal
          visible={infoAlertVisible}
          title={alertInfo.title}
          message={alertInfo.message}
          onClose={closeInfoAlert}
          primaryColor={config.colors.secondary} // אפשר להשתמש בצבע משני מהקונפיג
        />

        {/* מודאל מחיקת יעד */}
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          itemName={targetToDeleteIndex !== null ? editConfig.donation_targets[targetToDeleteIndex].name || "יעד ללא שם" : ""}
          onConfirm={confirmDeleteTarget}
          onCancel={() => {
            setDeleteModalVisible(false);
            setTargetToDeleteIndex(null);
          }}
          primaryColor={config.colors.primary} 
        />

        {/* מודאל הצלחה */}
        <SuccessModal
          visible={successModalVisible}
          title="הצלחה! ✅"
          message="כל ההגדרות נשמרו בהצלחה במערכת"
          buttonText="סגור"
          onButtonPress={handleSuccessModalClose}
          primaryColor={config.colors.primary} // אם יש צבע הצלחה בקונפיג
        />

      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  backButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  placeholder: { width: 80 },
  content: { flex: 1, padding: 20 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 20, fontWeight: 'bold' },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
    textAlign: 'right',
  },
  inputGroup: { marginBottom: 15 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
    color: '#374151',
  },
  textInput: {
    backgroundColor: 'white',
    padding: 18,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 12,
    textAlign: 'right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  targetRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  targetInputs: {
    flex: 1,
    flexDirection: 'row-reverse',
    gap: 10,
  },
  removeTargetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTargetText: { fontSize: 18, color: '#dc2626', fontWeight: 'bold' },
  iconInput: {
    width: 60,
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  targetNameInput: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: 'white',
    fontSize: 16,
    textAlign: 'right',
  },
  addButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  preview: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'right',
    color: '#6b7280',
  },
  previewAmounts: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewChipText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    color: '#374151',
  },
  saveButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  bottomSpacer: { height: 40 },
  iconText: {
    fontSize: 24,
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginRight: 10,
  },
});