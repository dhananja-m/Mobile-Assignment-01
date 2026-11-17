import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
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

export default function HomeScreen() {
  const { items, addItem } = useItems();

  // Report Modal States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Lost' | 'Found' | 'Exchange'>('Lost');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [handover, setHandover] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Live Stats Calculation
  const lostCount = items.filter((i) => i.category === 'Lost' && !i.isClaimed).length;
  const foundCount = items.filter((i) => i.category === 'Found' && !i.isClaimed).length;
  const exchangeCount = items.filter((i) => i.category === 'Exchange' && !i.isClaimed).length;

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

  const handleAddItem = async () => {
    if (!title.trim() || !location.trim() || !contact.trim()) {
      Alert.alert('Missing Info', 'Please enter item title, location, and contact.');
      return;
    }

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const submittedTitle = title.trim();

    addItem({
      title: submittedTitle,
      category,
      location: location.trim(),
      date: today,
      contact: contact.trim(),
      handover: handover.trim() || 'Contact poster directly',
      description: description.trim() || 'No additional description provided.',
      imageUri,
    });

    setTitle('');
    setCategory('Lost');
    setLocation('');
    setContact('');
    setHandover('');
    setDescription('');
    setImageUri(null);
    setAddModalVisible(false);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${category} Item Posted!`,
            body: `"${submittedTitle}" is now live on the UniFind campus board.`,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.log('Notification error:', error);
    }

    // Report කළාට පස්සේ කෙලින්ම Feed එකට යවන්න
    router.push('/(feed)/feed' as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Welcome Hero Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Welcome to UniFind</Text>
        <Text style={styles.heroSubtitle}>
          Campus Lost & Found + Student Item Exchange Portal
        </Text>
      </View>

      {/* Live Campus Summary Cards */}
      <Text style={styles.sectionTitle}>Active Campus Board</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderTopColor: '#DC2626' }]}>
          <Text style={[styles.statNumber, { color: '#DC2626' }]}>{lostCount}</Text>
          <Text style={styles.statLabel}>Lost</Text>
        </View>
        <View style={[styles.statBox, { borderTopColor: '#059669' }]}>
          <Text style={[styles.statNumber, { color: '#059669' }]}>{foundCount}</Text>
          <Text style={styles.statLabel}>Found</Text>
        </View>
        <View style={[styles.statBox, { borderTopColor: '#D97706' }]}>
          <Text style={[styles.statNumber, { color: '#D97706' }]}>{exchangeCount}</Text>
          <Text style={styles.statLabel}>Exchange</Text>
        </View>
      </View>

      {/* Main Navigation Action Cards */}
      <Text style={styles.sectionTitle}>What would you like to do?</Text>

      {/* Option 1: Report New Item */}
      <Pressable
        style={({ pressed }) => [styles.actionCard, styles.reportCard, pressed && { opacity: 0.85 }]}
        onPress={() => setAddModalVisible(true)}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="plus-circle-outline" size={32} color="#059669" />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>+ Report an Item</Text>
          <Text style={styles.actionDesc}>
            Post a lost item, found belonging, or item for student exchange
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={26} color="white" />
      </Pressable>

      {/* Option 2: View Existing Reports (Campus Feed) */}
      <Pressable
        style={({ pressed }) => [styles.actionCard, styles.feedCard, pressed && { opacity: 0.85 }]}
        onPress={() => router.push('/(feed)/feed' as any)}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="format-list-bulleted" size={32} color="#1E3A8A" />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>View Campus Reports ({items.length})</Text>
          <Text style={styles.actionDesc}>
            Browse, search, filter, and claim currently posted items
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={26} color="white" />
      </Pressable>

      {/* Report Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Report Campus Item</Text>

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
                  <Text style={styles.photoBtnText}>
                    {imageUri ? 'Change Photo' : '+ Attach Photo'}
                  </Text>
                </Pressable>
                {imageUri && (
                  <Image source={{ uri: imageUri }} style={styles.previewImg} />
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Item Title (e.g., Blue Umbrella) *"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Location (e.g., Science Library) *"
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
                placeholder="Handover Point (e.g., Security Counter)"
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
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={{ fontWeight: 'bold', color: '#4b5563' }}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.submitBtn} onPress={handleAddItem}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Post Item</Text>
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
  heroCard: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    borderRadius: 14,
    marginBottom: 18,
    elevation: 3,
  },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  heroSubtitle: { fontSize: 13, color: '#dbeafe' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderTopWidth: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#4b5563', fontWeight: '600', marginTop: 2 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 3,
  },
  reportCard: { backgroundColor: '#059669' },
  feedCard: { backgroundColor: '#1E3A8A' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontSize: 17, fontWeight: 'bold', color: 'white', marginBottom: 3 },
  actionDesc: { fontSize: 12, color: '#f3f4f6', lineHeight: 17 },
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap: 6 },
  catChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  catChipActive: { backgroundColor: '#1E3A8A' },
  catChipText: { fontWeight: 'bold', fontSize: 12, color: '#1f2937' },
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