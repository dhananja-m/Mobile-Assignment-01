import { Stack } from 'expo-router';

export default function FeedStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'UniFind - Lost & Found' }} />
      <Stack.Screen name="details" options={{ title: 'Item Details' }} />
    </Stack>
  );
}