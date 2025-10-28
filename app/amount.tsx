import { useConfig } from '@/context/configContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AmountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { config } = useConfig();
  
  const target = {
    id: params.targetId as string,
    name: params.targetName as string,
    icon: params.targetIcon as string
  };
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
const [monthsCount, setMonthsCount] = useState('unlimited');
const [showMonthPicker, setShowMonthPicker] = useState(false);

  
  const finalAmount = customAmount || selectedAmount;
  const totalAmount = finalAmount && isMonthly && monthsCount !== 'unlimited' 
  ? Number(finalAmount) * Number(monthsCount) 
  : finalAmount;

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: config.colors.primary }]}>← חזור</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: config.colors.primary }]}>בחירת סכום</Text>
        <View style={{ width: 80 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.targetBox, { borderColor: config.colors.secondary }]}>
          <Text style={styles.targetIcon}>{target.icon}</Text>
          <Text style={[styles.targetName, { color: config.colors.primary }]}>
            {target.name}
          </Text>
        </View>
        
        <View style={styles.grid}>
          {config.quick_amounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              onPress={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              style={[
                styles.amountButton,
                { borderColor: config.colors.secondary },
                selectedAmount === amount && !customAmount && {
                  backgroundColor: config.colors.primary
                }
              ]}
            >
              <Text style={[
                styles.amountText,
                { color: selectedAmount === amount && !customAmount ? 'white' : config.colors.primary }
              ]}>
                ₪{amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.customBox, { borderColor: config.colors.secondary }]}>
          <Text style={[styles.label, { color: config.colors.primary }]}>סכום אחר</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { borderColor: config.colors.secondary }]}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedAmount(null);
              }}
              placeholder="הזן סכום"
              keyboardType="numeric"
              textAlign="right"
            />
            <Text style={styles.currency}>₪</Text>
          </View>
        </View>
        <View style={[styles.monthlyBox, { borderColor: config.colors.secondary }]}>
  <View style={styles.monthlyHeader}>
    <View style={styles.monthlyIconContainer}>
      <Text style={styles.monthlyIcon}>🔄</Text>
    </View>
    <View style={styles.monthlyTextContainer}>
      <Text style={[styles.monthlyLabel, { color: config.colors.primary }]}>
        תרומה חודשית
      </Text>
      <Text style={styles.monthlySubtext}>
        תרומה קבועה כל חודש
      </Text>
    </View>
    <Switch
      value={isMonthly}
      onValueChange={setIsMonthly}
      trackColor={{ false: '#d1d5db', true: config.colors.secondary }}
      thumbColor={isMonthly ? config.colors.primary : '#f4f3f4'}
    />
  </View>
  
  {isMonthly && (
    <View style={styles.monthsInputContainer}>
      <Text style={[styles.monthsLabel, { color: config.colors.primary }]}>
        למשך:
      </Text>
      <TouchableOpacity 
        style={[styles.pickerButton, { borderColor: config.colors.secondary }]}
        onPress={() => setShowMonthPicker(true)}
      >
        <Text style={[styles.pickerText, { color: config.colors.primary }]}>
          {monthsCount === 'unlimited' 
            ? 'ללא הגבלה' 
            : `${monthsCount} ${Number(monthsCount) === 1 ? 'חודש' : 'חודשים'}`}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>
      {/* כאן ה-TouchableOpacity של הפיקר */}
    </View>
  )}
</View>

    

{/* Modal לבחירת חודשים */}
<Modal
  visible={showMonthPicker}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowMonthPicker(false)}
>
  <TouchableOpacity 
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setShowMonthPicker(false)}
  >
    <View style={styles.modalContent}>
      <View style={[styles.modalHeader, { backgroundColor: config.colors.primary }]}>
        <Text style={styles.modalTitle}>בחר משך תרומה</Text>
      </View>
      
      <ScrollView style={styles.optionsList}>
        <TouchableOpacity
          style={[
            styles.optionItem,
            monthsCount === 'unlimited' && { backgroundColor: '#f0fdf4' }
          ]}
          onPress={() => {
            setMonthsCount('unlimited');
            setShowMonthPicker(false);
          }}
        >
          <Text style={[
            styles.optionText,
            { color: config.colors.primary },
            monthsCount === 'unlimited' && { fontWeight: 'bold' }
          ]}>
            ללא הגבלה
          </Text>
          {monthsCount === 'unlimited' && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        
        {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.optionItem,
              monthsCount === num.toString() && { backgroundColor: '#f0fdf4' }
            ]}
            onPress={() => {
              setMonthsCount(num.toString());
              setShowMonthPicker(false);
            }}
          >
            <Text style={[
              styles.optionText,
              { color: config.colors.primary },
              monthsCount === num.toString() && { fontWeight: 'bold' }
            ]}>
              {num} {num === 1 ? 'חודש' : 'חודשים'}
            </Text>
            {monthsCount === num.toString() && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: config.colors.primary }]}
        onPress={() => setShowMonthPicker(false)}
      >
        <Text style={styles.closeButtonText}>סגור</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: config.colors.primary },
            !finalAmount && styles.disabled
          ]}
          onPress={() => router.push({
            pathname: '/details', // כרגע אליהו ביקש שיהיה בלי זיהוי עם הזנה מלאה
            // pathname: '/phone-verification', 
            params: { 
                ...params, 
                amount: finalAmount?.toString(),
                isMonthly: isMonthly.toString(),
                monthsCount: isMonthly ? monthsCount : '1',
                totalAmount: totalAmount?.toString()
            }
            })}
          disabled={!finalAmount}
        >
          <Text style={styles.continueText}>המשך</Text>
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
  targetBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  targetIcon: { fontSize: 40, marginBottom: 10 },
  targetName: { fontSize: 20, fontWeight: 'bold' },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountButton: {
    width: '31%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountText: { fontSize: 22, fontWeight: 'bold' },
  customBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 10 },
  inputWrapper: { position: 'relative' },
  input: {
    backgroundColor: 'white',
    padding: 15,
    paddingRight: 50,
    fontSize: 20,
    borderWidth: 2,
    borderRadius: 10,
    textAlign: 'right',
  },
  currency: { position: 'absolute', right: 15, top: 15, fontSize: 20, color: '#9ca3af' },
  pickerButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
  },
  checkmark: {
    fontSize: 20,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 18,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthlyBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthlyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthlyIcon: {
    fontSize: 28,
  },
  monthlyTextContainer: {
    flex: 1,
    marginHorizontal: 15,
    alignItems: 'flex-end',
  },
  monthlyLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  monthlySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  monthsInputContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  monthsLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 10,
  },
  continueButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: { backgroundColor: '#d1d5db', opacity: 0.5 },
  continueText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});