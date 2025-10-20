import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_QR_CONFIG, SynagogueConfig } from '../config/mockConfig';

// API Service
const API = {
  login: async (name: string, terminal: string, company: string) => {
    try {
      const response = await fetch('https://tak.co.il/cashier/index.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `name=${encodeURIComponent(name)}&terminal=${encodeURIComponent(terminal)}&company=${encodeURIComponent(company)}`,
      });
      
      const data = await response.json();

    if (!data.success) {
    throw new Error(data.message);
    }

    // בדיקה אם message הוא מחרוזת
    if (typeof data.message === 'string') {
    try {
        // ניסיון לפרסר את המחרוזת כ-JSON
        return JSON.parse(data.message);
    } catch (e) {
        // במקרה שהפרסור נכשל
        throw new Error(data.message);
    }
    } else {
    // אם message אינו מחרוזת
    throw new Error(String(data.message));
    }
    
    } catch (error) {
      throw error;
    }
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const config = MOCK_QR_CONFIG;
  
  const [name, setName] = useState('');
  const [terminalName, setTerminalName] = useState('');
  const [companyNumber, setCompanyNumber] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    terminalName: '',
    companyNumber: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Load saved credentials when component mounts
  useEffect(() => {
    loadSavedCredentials();
  }, []);
  
  const loadSavedCredentials = async () => {
    try {
      const savedName = await AsyncStorage.getItem('name');
      const savedTerminal = await AsyncStorage.getItem('terminal');
      const savedCompany = await AsyncStorage.getItem('company');
      
      if (savedName) setName(savedName);
      if (savedTerminal) setTerminalName(savedTerminal);
      if (savedCompany) setCompanyNumber(savedCompany);
    } catch (error) {
      console.error('Failed to load saved credentials', error);
    }
  };
  
  const saveCredentials = async () => {
    try {
      await AsyncStorage.setItem('name', name);
      await AsyncStorage.setItem('terminal', terminalName);
      await AsyncStorage.setItem('company', companyNumber);
    } catch (error) {
      console.error('Failed to save credentials', error);
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: name.trim() === '' ? 'שם הוא שדה חובה' : '',
      terminalName: terminalName.trim() === '' ? 'שם מסוף הוא שדה חובה' : '',
      companyNumber: companyNumber.trim() === '' ? 'מספר חברה הוא שדה חובה' : ''
    };

    // Check if terminal name is too long (like in Kotlin code)
    if (terminalName.length >= 50) {
      newErrors.terminalName = 'שם מסוף ארוך מדי';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Save credentials
      await saveCredentials();
      
      // Call login API
      const result = await API.login(name, terminalName, companyNumber);
    
      updateConfigFromResponse(result,config);
      
      // If login successful, navigate to Home and pass data
      router.push({
        pathname: '/Home',
        params: {
        }
      });
      
    } catch (error: any) {
      Alert.alert('שגיאת התחברות', error.message || 'אירעה שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };
  const updateConfigFromResponse = (messageObject: any, config: SynagogueConfig): SynagogueConfig => {
    try {
      // message -> kupaInfo
        // כעת נוכל לגשת ל-kupaInfo
        if (messageObject && messageObject.kupaInfo) {
          let kupaInfoArray;
          
          // בדוק אם kupaInfo הוא מחרוזת או מערך
          if (typeof messageObject.kupaInfo === 'string') {
            try {
              kupaInfoArray = JSON.parse(messageObject.kupaInfo);
            } catch (e) {
              console.error('Failed to parse kupaInfo as JSON:', e);
              return config;
            }
          } else {
            kupaInfoArray = messageObject.kupaInfo;
          }

          // בדוק שיש מידע במערך
          if (Array.isArray(kupaInfoArray) && kupaInfoArray.length > 0) {
            const kupaData = kupaInfoArray[0];
            
            console.log('Found kupaData:', kupaData); // לוג לדיבוג
            
            // עדכון שם בית הכנסת אם קיים
            if (kupaData.kupaKabalaName) {
              config.synagogue.name = kupaData.kupaKabalaName;
              console.log('Updated synagogue name to:', kupaData.kupaKabalaName);
            }

            // עדכון אפשרות תשלום בביט
            if (kupaData.bitOption && kupaData.bitOption == true) {
                config.settings.bit_option = true;
                console.log('Updated settings bitOption to:', true);
            } else {
                config.settings.bit_option = false;
                console.log('Updated settings bitOption to:', false);
            }
            
            // אפשר להוסיף עוד שדות שרוצים לעדכן כאן
            if (kupaData.kupaLogoUrl) {
              config.synagogue.logo_url = kupaData.kupaLogoUrl;
            }
            
            // עדכון צבעים אם קיימים
            if (kupaData.kupaPrimaryColor) {
              config.colors.primary = kupaData.kupaPrimaryColor;
            }
            if (kupaData.kupaSecondaryColor) {
              config.colors.secondary = kupaData.kupaSecondaryColor;
            }
            if (kupaData.kupaBackgroundColor) {
              config.colors.background = kupaData.kupaBackgroundColor;
            }
            
            // שמירת הקונפיגורציה המעודכנת
            AsyncStorage.setItem('synagogueConfig', JSON.stringify(config))
              .catch(err => console.error('Failed to save updated config', err));
          }
        } else {
          console.log('kupaInfo not found in message object:');
        //   console.log('kupaInfo not found in message object:', messageObject);
        }
        
      return config;
    } catch (error) {
      console.error('Error updating config from response:', error);
      return config; // החזרת הקונפיג המקורי במקרה של שגיאה
    }
  };

  type FieldProps = {
    label: string;
    value: string;
    setter: (text: string) => void;
    errorMessage: string;
    placeholder: string;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  };

  const renderField = ({
    label, 
    value, 
    setter, 
    errorMessage, 
    placeholder, 
    keyboardType = 'default'
  }: FieldProps) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: config.colors.primary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: errorMessage ? '#ef4444' : config.colors.secondary }
        ]}
        value={value}
        onChangeText={(text: string) => {
          setter(text);
          setErrors(prev => ({ ...prev, [label.toLowerCase()]: '' }));
        }}
        placeholder={placeholder}
        keyboardType={keyboardType}
        textAlign="right"
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: config.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: config.colors.primary }]}>התחברות למערכת</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/* <Text style={styles.icon}>📱⋯⋯📱</Text> */}
          <Text style={styles.icon}>🔐</Text>
        </View>
        
        <Text style={[styles.description, { color: config.colors.primary }]}>
          ברוכים הבאים  
        </Text>
        <Text style={styles.subdescription}>
          בכדי לחבר את המכשיר למערכת, אנא הזינו את הפרטים  
        </Text>
        
        {renderField({
          label: 'שם',
          value: name,
          setter: setName,
          errorMessage: errors.name,
          placeholder: 'הזן שם מלא'
        })}
        {renderField({
          label: 'מסוף',
          value: terminalName,
          setter: setTerminalName,
          errorMessage: errors.terminalName,
          placeholder: 'הזן שם מסוף'
        })}
        {renderField({
          label: 'חברה',
          value: companyNumber,
          setter: setCompanyNumber,
          errorMessage: errors.companyNumber,
          placeholder: 'הזן מספר חברה',
          keyboardType: 'number-pad'
        })}
        
        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: config.colors.primary },
            loading && styles.disabled
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginText}>התחבר</Text>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: 40,
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
});