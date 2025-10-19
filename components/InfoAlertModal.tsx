import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface InfoAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  primaryColor?: string;
}

const InfoAlertModal: React.FC<InfoAlertModalProps> = ({ 
  visible, 
  title, 
  message, 
  onClose,
  primaryColor = '#3f51b5' // צבע ברירת מחדל כחול
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
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
    } else {
      // איפוס אנימציות כשהמודאל נסגר
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
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
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>ℹ️</Text>
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
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>הבנתי</Text>
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
  infoIconContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  infoIcon: {
    fontSize: 48,
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

export default InfoAlertModal;