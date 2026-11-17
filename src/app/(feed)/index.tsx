import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    AppState,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useItems } from '../../context/ItemsContext';
import { CampusItem } from '../../data/mockItems';

export default function FeedScreen() {
  const { items } = useItems();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // AppState listener to detect background -> foreground transitions
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
        console.log('App returned to foreground at:', now);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

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
      {/* Top Status & Filter Bar */}
      <View style={styles.topBar}>
        <Text style={styles.statusText}>{boardStatus}</Text>
        <Pressable
          style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.7 }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.filterBtnText}>Filter: {selectedCategory}</Text>
        </Pressable>
      </View>

      {/* Hard-coded data rendered via FlatList */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal for filtering data */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
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
                  setModalVisible(false);
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
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#555', fontWeight: 'bold' }}>Close</Text>
            </Pressable>
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
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#1E3A8A', flex: 1 },
  filterBtn: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  thumbnail: { width: 70, height: 70, borderRadius: 8, resizeMode: 'contain' },
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
  modalBox: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
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
});