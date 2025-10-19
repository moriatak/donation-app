import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onButtonPress: () => void;
  primaryColor?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  visible, 
  title, 
  message, 
  buttonText,
  onButtonPress,
  primaryColor = '#4caf50' // צבע ברירת מחדל ירוק
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkOpacityAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  
  useEffect(() => {
    if (visible) {
      // אנימציית כניסה כשהמודאל מוצג
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
      
      // אנימציה של סימן ה-V לאחר הופעת המודאל
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(checkmarkScaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(checkmarkOpacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          })
        ]).start();
      }, 200);
    } else {
      // איפוס אנימציות כשהמודאל נסגר
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      checkmarkScaleAnim.setValue(0);
      checkmarkOpacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onButtonPress}
    >
      <TouchableWithoutFeedback onPress={onButtonPress}>
        <Animated.View 
          style={[
            styles.modalOverlay, 
            { opacity: fadeAnim }
          ]}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={[
                styles.modalContainer,
                { 
                  transform: [{ scale: scaleAnim }],
                  width: width > 500 ? 400 : width * 0.85
                }
              ]}
            >
              <View style={styles.successIconContainer}>
                <View style={[styles.checkmarkCircle, { backgroundColor: '#4caf50' }]}>
                  <Animated.Text 
                    style={[
                      styles.checkmark,
                      { 
                        opacity: checkmarkOpacityAnim,
                        transform: [{ scale: checkmarkScaleAnim }]
                      }
                    ]}
                  >
                    ✓
                  </Animated.Text>
                </View>
              </View>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>
                  {message}
                </Text>
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: primaryColor }]}
                  onPress={onButtonPress}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  checkmarkCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  modalHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
  },
  modalBody: {
    padding: 24,
    paddingTop: 8,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    lineHeight: 24,
  },
  modalFooter: {
    padding: 16,
    paddingTop: 0,
    marginBottom: 16,
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
});

export default SuccessModal;