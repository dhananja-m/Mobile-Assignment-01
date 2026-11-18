import { MaterialCommunityIcons } from '@expo/vector-icons';
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

type SortOption = 'newest' | 'oldest' | 'nameAsc' | 'nameDesc';

export default function FeedScreen() {
  const { items, addItem } = useItems();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
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
      Alert.alert(
        'Permission Required',
        'Please allow photo library access to attach an item photo.'
      );
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

  // 1. Filter by Category + Real-Time Search Query
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesSearch =
      !normalizedQuery ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.location.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  // 2. Sort Filtered Results (Time-wise & Name-wise)
  const displayedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'nameAsc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'nameDesc') {
      return b.title.localeCompare(a.title);
    }
    const timeA = new Date(a.date).getTime() || Number(a.id) || 0;
    const timeB = new Date(b.date).getTime() || Number(b.id) || 0;

    if (sortBy === 'oldest') {
      return timeA - timeB;
    }
    return timeB - timeA;
  });

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

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'newest', label: 'Time: Newest First' },
    { key: 'oldest', label: 'Time: Oldest First' },
    { key: 'nameAsc', label: 'Name: A → Z' },
    { key: 'nameDesc', label: 'Name: Z → A' },
  ];

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
            <Text style={styles.filterBtnText}>Filter & Sort</Text>
          </Pressable>
        </View>
      </View>

      {/* Real-Time Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items, locations, or keywords..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#6b7280" />
          </Pressable>
        )}
      </View>

      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-search-outline" size={44} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No matching items found</Text>
            <Text style={styles.emptySubtitle}>
              Try clearing your search or switching the category filter.
            </Text>
          </View>
        }
      />

      {/* Modal 1: Filter & Sort */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Filter & Sort Feed</Text>

              <Text style={styles.sectionHeader}>Category</Text>
              <View style={styles.catRow}>
                {['All', 'Found', 'Lost', 'Exchange'].map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.catChip,
                      selectedCategory === cat && styles.catChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        selectedCategory === cat && { color: 'white' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.sectionHeader}>Sort By</Text>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.modalOption,
                    sortBy === option.key && styles.modalOptionActive,
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      sortBy === option.key && { color: 'white' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}

              <Pressable
                style={styles.applyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Apply</Text>
              </Pressable>
            </ScrollView>
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
    marginBottom: 10,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 6,
    marginTop: 4,
  },
  modalOption: {
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  modalOptionActive: { backgroundColor: '#1E3A8A' },
  modalOptionText: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  applyBtn: {
    marginTop: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
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