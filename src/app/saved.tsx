import { router } from 'expo-router';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useItems } from '../context/ItemsContext';

export default function SavedScreen() {
  const { items, toggleSave } = useItems();

  const savedItems = items.filter((item) => item.isSaved);

  return (
    <View style={styles.container}>
      {savedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Saved Items Yet</Text>
          <Text style={styles.emptySub}>
            Bookmark or claim items in the Campus Feed tab to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
              onPress={() =>
                router.push({ pathname: '/(feed)/details', params: { id: item.id } })
              }
            >
              <Image source={item.image} style={styles.thumb} />
              <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.status}>
                  {item.isClaimed ? 'Claimed' : 'Bookmarked'} - {item.location}
                </Text>
              </View>
              <Pressable onPress={() => toggleSave(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f0f4f8' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  thumb: { width: 55, height: 55, resizeMode: 'contain' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: 'bold' },
  status: { fontSize: 12, color: '#059669', fontWeight: 'bold', marginTop: 4 },
  removeBtn: { padding: 8 },
  removeText: { color: '#DC2626', fontWeight: 'bold', fontSize: 12 },
});