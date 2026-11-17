import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useItems } from '../../context/ItemsContext';

export default function ItemDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, toggleSave, markAsClaimed, updateItem, deleteItem } = useItems();

  const item = items.find((entry) => entry.id === id);

  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Lost' | 'Found' | 'Exchange'>('Lost');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [handover, setHandover] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Item not found.</Text>
      </View>
    );
  }

  const openEditModal = () => {
    setTitle(item.title);
    setCategory(item.category);
    setLocation(item.location);
    setContact(item.contact);
    setHandover(item.handover);
    setDescription(item.description);
    setImageUri(null);
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSaveEdit = async () => {
    if (!title.trim() || !location.trim() || !contact.trim()) {
      Alert.alert('Missing Info', 'Title, location, and contact cannot be empty.');
      return;
    }

    updateItem({
      id: item.id,
      title: title.trim(),
      category,
      location: location.trim(),
      date: item.date,
      contact: contact.trim(),
      handover: handover.trim() || 'Contact poster directly',
      description: description.trim() || 'No additional description provided.',
      imageUri,
    });

    setEditModalVisible(false);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Report Updated',
            body: `"${title.trim()}" details have been updated.`,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.log('Notification error:', error);
    }
  };

  const handleClaim = async () => {
    markAsClaimed(item.id);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Item Marked as Claimed',
            body: `You marked "${item.title}" as claimed.`,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.log('Notification error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteItem(item.id);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(feed)');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Image source={item.image} style={styles.heroImage} />

      <View style={styles.headerRow}>
        <Text
          style={[
            styles.badge,
            item.category === 'Found'
              ? styles.foundBadge
              : item.category === 'Lost'
              ? styles.lostBadge
              : styles.exchangeBadge,
          ]}
        >
          {item.category}
        </Text>
        {item.isClaimed && <Text style={styles.claimedTag}>CLAIMED</Text>}
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{item.location}</Text>

        <Text style={styles.label}>Date Reported</Text>
        <Text style={styles.value}>{item.date}</Text>

        <Text style={styles.label}>Contact</Text>
        <Text style={styles.value}>{item.contact}</Text>

        <Text style={styles.label}>Handover Point</Text>
        <Text style={styles.value}>{item.handover}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{item.description}</Text>
      </View>

      {/* Action Buttons */}
      <Pressable
        style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.8 }]}
        onPress={openEditModal}
      >
        <Text style={styles.btnText}>Edit Report</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.saveBtn,
          item.isSaved && styles.savedActiveBtn,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => toggleSave(item.id)}
      >
        <Text style={styles.btnText}>
          {item.isSaved ? 'Remove from Saved' : 'Bookmark Item'}
        </Text>
      </Pressable>

      {!item.isClaimed && (
        <Pressable
          style={({ pressed }) => [styles.claimBtn, pressed && { opacity: 0.8 }]}
          onPress={handleClaim}
        >
          <Text style={styles.btnText}>Mark as Claimed</Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.8 }]}
        onPress={handleDelete}
      >
        <Text style={styles.btnText}>Delete Report</Text>
      </Pressable>

      {/* Edit Report Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Edit Campus Item</Text>

              <View style={styles.catRow}>
                {(['Lost', 'Found', 'Exchange'] as const).map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.catChip,
                      category === cat && styles.catChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        category === cat && { color: 'white' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.photoRow}>
                <Pressable style={styles.photoBtn} onPress={pickImage}>
                  <Text style={styles.photoBtnText}>Change Photo</Text>
                </Pressable>
                <Image
                  source={imageUri ? { uri: imageUri } : item.image}
                  style={styles.previewImg}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Item Title *"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Location *"
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                style={styles.input}
                placeholder="Your Name & Phone *"
                value={contact}
                onChangeText={setContact}
              />
              <TextInput
                style={styles.input}
                placeholder="Handover Point"
                value={handover}
                onChangeText={setHandover}
              />
              <TextInput
                style={[styles.input, { height: 65, textAlignVertical: 'top' }]}
                placeholder="Short description..."
                multiline
                value={description}
                onChangeText={setDescription}
              />

              <View style={styles.formActions}>
                <Pressable
                  style={styles.formCancelBtn}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={{ fontWeight: 'bold', color: '#4b5563' }}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.submitBtn} onPress={handleSaveEdit}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Changes</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 16, color: '#4b5563' },
  heroImage: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    resizeMode: 'cover',
    marginBottom: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  badge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
  },
  foundBadge: { backgroundColor: '#059669' },
  lostBadge: { backgroundColor: '#DC2626' },
  exchangeBadge: { backgroundColor: '#D97706' },
  claimedTag: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  infoCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginTop: 8 },
  value: { fontSize: 15, color: '#1f2937', marginTop: 2 },
  editBtn: {
    backgroundColor: '#D97706',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: '#1E3A8A',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  savedActiveBtn: { backgroundColor: '#4b5563' },
  claimBtn: {
    backgroundColor: '#059669',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '88%',
    maxHeight: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 6 },
  catChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  catChipActive: { backgroundColor: '#1E3A8A' },
  catChipText: { fontWeight: 'bold', fontSize: 13, color: '#1f2937' },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  photoBtn: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  photoBtnText: { color: '#1E3A8A', fontWeight: 'bold', fontSize: 13 },
  previewImg: { width: 50, height: 50, borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  formCancelBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
});