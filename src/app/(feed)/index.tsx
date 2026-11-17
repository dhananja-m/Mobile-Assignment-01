import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    AppState,
    FlatList,
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
import { CampusItem } from '../../data/mockItems';

export default function FeedScreen() {
  const { items, addItem } = useItems();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

  // Add Lost/Found Item Modal States
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Lost' | 'Found' | 'Exchange'>('Lost');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [handover, setHandover] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // AppState listener
  const appState = useRef(AppState.currentState);
  const [boardStatus, setBoardStatus] = useState<string>('Active (Just now)');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current?.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const now = new Date().toLocaleTimeString();
        setBoardStatus(`Synced on resume: ${now}`);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow photo library access to attach an item photo.');
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

    // Reset form & close modal
    setTitle('');
    setCategory('Lost');
    setLocation('');
    setContact('');
    setHandover('');
    setDescription('');
    setImageUri(null);
    setAddModalVisible(false);

    // Trigger local notification safely
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
  };

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const renderItem = ({ item }: { item: CampusItem }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() =>
        router.push({ pathname: '/(feed)/details', params: { id: item.id } })
      }
    >
      <Image source={item.image} style={styles.thumbnail} />
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
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
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.meta}>Location: {item.location}</Text>
        <Text style={styles.meta}>Date: {item.date}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Top Status & Action Bar */}
      <View style={styles.topBar}>
        <Text style={styles.statusText}>{boardStatus}</Text>
        <View style={styles.topActions}>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={styles.filterBtnText}>+ Report</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterBtnText}>Filter: {selectedCategory}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal 1: Filter by Category */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            {['All', 'Found', 'Lost', 'Exchange'].map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.modalOption,
                  selectedCategory === cat && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setFilterModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedCategory === cat && { color: 'white' },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={{ color: '#555', fontWeight: 'bold' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Report Lost / Found / Exchange Item */}
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

              {/* Category Selector */}
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

              {/* Photo Picker Section */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f0f4f8' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: { fontSize: 11, fontWeight: 'bold', color: '#1E3A8A', flex: 1 },
  topActions: { flexDirection: 'row', gap: 6 },
  addBtn: {
    backgroundColor: '#059669',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  filterBtn: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  filterBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardPressed: { opacity: 0.7 },
  thumbnail: { width: 70, height: 70, borderRadius: 8, resizeMode: 'cover' },
  cardContent: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  badge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  foundBadge: { backgroundColor: '#059669' },
  lostBadge: { backgroundColor: '#DC2626' },
  exchangeBadge: { backgroundColor: '#D97706' },
  claimedTag: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 12, color: '#4b5563' },
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
  modalOption: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  modalOptionActive: { backgroundColor: '#1E3A8A' },
  modalOptionText: { fontSize: 15, fontWeight: 'bold' },
  cancelBtn: { marginTop: 10, alignItems: 'center', padding: 8 },
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