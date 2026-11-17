import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Tabs } from 'expo-router';
import { ItemsProvider } from '../context/ItemsContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  return (
    <ItemsProvider>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#1E3A8A' }}>
        <Tabs.Screen
          name="(feed)"
          options={{
            title: 'Campus Feed',
            headerShown: false, // Hidden because the Stack inside (feed) has its own header
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="compass-outline" size={24} color={String(color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'My Saved Items',
            headerStyle: { backgroundColor: '#1E3A8A' },
            headerTintColor: '#fff',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="bookmark-check-outline" size={24} color={String(color)} />
            ),
          }}
        />
      </Tabs>
    </ItemsProvider>
  );
}