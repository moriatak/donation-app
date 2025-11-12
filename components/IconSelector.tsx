import { DONATION_ICONS } from '@/config/donationIcons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface IconSelectorProps {
  visible: boolean;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ visible, onSelect, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.iconSelectorContainer}>
              <Text style={styles.iconSelectorTitle}>בחר אייקון</Text>
              <View style={styles.iconsGrid}>
                {DONATION_ICONS.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.iconItem}
                    onPress={() => {
                      onSelect(icon);
                      onClose();
                    }}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
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
  iconSelectorContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  iconSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  iconText: {
    fontSize: 24,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default IconSelector;
export { DONATION_ICONS };
