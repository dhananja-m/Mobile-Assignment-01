import * as Notifications from 'expo-notifications';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useItems } from '../../context/ItemsContext';

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, toggleSave, markAsClaimed } = useItems();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Item not found.</Text>
      </View>
    );
  }

  const sendLocalNotification = async (title: string, body: string) => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // Immediate local notification
    });
  };

  const handleBookmark = async () => {
    toggleSave(item.id);
    if (!item.isSaved) {
      await sendLocalNotification(
        'Item Bookmarked!',
        `"${item.title}" has been added to My Saved Items.`
      );
    }
  };

  const handleConfirmClaim = async () => {
    markAsClaimed(item.id);
    setModalVisible(false);
    await sendLocalNotification(
      'Handover Confirmed!',
      `You claimed "${item.title}". Contact: ${item.contact}`
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.category}>{item.category.toUpperCase()}</Text>
      <Text style={styles.title}>{item.title}</Text>

      <Image source={item.image} style={styles.image} />

      <View style={styles.card}>
        <Text style={styles.text}>Location: {item.location}</Text>
        <Text style={styles.text}>Date: {item.date}</Text>
        <Text style={styles.text}>Handover Point: {item.handover}</Text>
        <Text style={styles.text}>Contact: {item.contact}</Text>
      </View>

      <Text style={styles.descHeader}>Description</Text>
      <Text style={styles.desc}>{item.description}</Text>

      <Pressable
        style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.7 }]}
        onPress={handleBookmark}
      >
        <Text style={styles.buttonText}>
          {item.isSaved ? 'Bookmarked (Tap to Remove)' : 'Bookmark Item'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.claimButton,
          item.isClaimed && styles.disabledButton,
          pressed && { opacity: 0.7 },
        ]}
        disabled={item.isClaimed}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {item.isClaimed ? 'Already Claimed' : 'Claim / Request Handover'}
        </Text>
      </Pressable>

      {/* Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Action</Text>
            <Text style={styles.modalText}>
              Confirm that you want to claim "{item.title}"?
            </Text>
            <View style={styles.modalRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleConfirmClaim}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center', backgroundColor: '#fff', flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  category: { fontSize: 13, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  image: { width: 150, height: 150, resizeMode: 'contain', marginBottom: 20 },
  card: {
    width: '100%',
    backgroundColor: '#f0f4f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  text: { fontSize: 15, marginBottom: 8, color: '#1f2937' },
  descHeader: { alignSelf: 'flex-start', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  desc: { alignSelf: 'flex-start', fontSize: 14, color: '#4b5563', marginBottom: 25 },
  saveButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  claimButton: {
    width: '100%',
    backgroundColor: '#059669',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#9ca3af' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 14, color: '#4b5563', marginBottom: 20 },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { padding: 10 },
  confirmBtn: { backgroundColor: '#059669', padding: 10, borderRadius: 8 },
});