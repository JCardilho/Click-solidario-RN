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
import { Dimensions, Text, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  const queryClient = new QueryClient();
  const { NotificationsProvider, useNotifications, ...events } = createNotifications({
    notificationWidth: Dimensions.get('window').width,
    notificationPosition: 'top-left',
    isNotch: true,

    defaultStylesSettings: {
      successConfig: {
        bgColor: '#d5ffd5',
        defaultIconType: 'no-icon',
        titleFamily: 'Kanit_400Regular',
      },
      infoConfig: {
        bgColor: '#f8ffd5',
        defaultIconType: 'no-icon',
        titleFamily: 'Kanit_400Regular',
      },
      errorConfig: {
        bgColor: '#ffd5d5',
        defaultIconType: 'no-icon',
        titleFamily: 'Kanit_400Regular',
      },
      warningConfig: {
        bgColor: '#f8ffd5',
        defaultIconType: 'no-icon',
        titleFamily: 'Kanit_400Regular',
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FontsLoadProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <NotificationsProvider />
            <Stack>
              <Stack.Screen name="registrar" options={{ headerShown: false }} />
              <Stack.Screen name="entrar" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs-stack)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </FontsLoadProvider>
    </QueryClientProvider>
  );
}
