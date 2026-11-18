import { Stack } from 'expo-router';

export default function FeedLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'UniFind Home' }}
      />
      <Stack.Screen
        name="feed"
        options={{ title: 'Campus Feed' }}
      />
      <Stack.Screen
        name="details"
        options={{ title: 'Item Details' }}
      />
    </Stack>
  );
}