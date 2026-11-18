import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useItems } from '../context/ItemsContext';
import { CampusItem } from '../data/mockItems';

export default function SavedItemsScreen() {
  const { items, toggleSave } = useItems();

  const savedItems = items.filter((item) => item.isSaved);

  const renderSavedItem = ({ item }: { item: CampusItem }) => (
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

      <Pressable
        style={styles.removeBtn}
        onPress={() => toggleSave(item.id)}
        hitSlop={8}
      >
        <MaterialCommunityIcons name="bookmark-remove" size={22} color="#DC2626" />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderSavedItem}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bookmark-off-outline"
              size={52}
              color="#9ca3af"
            />
            <Text style={styles.emptyTitle}>No Saved Items Yet</Text>
            <Text style={styles.emptySubtitle}>
              Bookmark items from the Campus Feed or mark them as claimed to track them here.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.browseBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => router.push('/(feed)/feed' as any)}
            >
              <Text style={styles.browseBtnText}>Browse Campus Feed</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f0f4f8' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  removeBtn: {
    padding: 8,
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  browseBtn: {
    marginTop: 18,
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  browseBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});