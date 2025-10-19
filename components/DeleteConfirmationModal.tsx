import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface DeleteConfirmationModalProps {
  visible: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  primaryColor?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  visible, 
  itemName, 
  onConfirm, 
  onCancel,
  primaryColor = '#d32f2f' // צבע ברירת מחדל אדום
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
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
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
                  width: width > 500 ? 450 : width * 0.85
                }
              ]}
            >
              <View style={styles.warningIconContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
              </View>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>האם למחוק את היעד?</Text>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>
                  {itemName ? 
                    `אתה עומד למחוק את היעד "${itemName}".` : 
                    'אתה עומד למחוק את היעד שנבחר.'}
                </Text>
                <Text style={styles.modalSubMessage}>
                  פעולה זו אינה ניתנת לביטול.
                </Text>
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>ביטול</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton, { backgroundColor: primaryColor }]}
                  onPress={onConfirm}
                >
                  <Text style={styles.deleteButtonText}>מחק</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  warningIconContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  warningIcon: {
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
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 0,
    marginBottom: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 8,
    elevation: 1,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  deleteButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
});

export default DeleteConfirmationModal;