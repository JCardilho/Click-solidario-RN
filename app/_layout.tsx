import { useFonts } from '@expo-google-fonts/kanit';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Stack } from 'expo-router';
import { Kanit_400Regular } from './../node_modules/@expo-google-fonts/kanit/index';
import { Montserrat_400Regular } from './../node_modules/@expo-google-fonts/montserrat/index.d';
import { FontsLoadProvider } from '~/utils/hooks/fontsLoad';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createNotifications } from 'react-native-notificated';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Layout() {
  const queryClient = new QueryClient();
  const { NotificationsProvider, useNotifications, ...events } = createNotifications({
    notificationWidth: Dimensions.get('window').width,
    notificationPosition: 'top-left',
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FontsLoadProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NotificationsProvider />
          <BottomSheetModalProvider>
            <Stack>
              <Stack.Screen name="registrar" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs-stack)" options={{ headerShown: false }} />
            </Stack>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </FontsLoadProvider>
    </QueryClientProvider>
  );
}
