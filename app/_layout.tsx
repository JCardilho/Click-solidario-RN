import { useFonts } from '@expo-google-fonts/kanit';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Stack } from 'expo-router';
import { Kanit_400Regular } from './../node_modules/@expo-google-fonts/kanit/index';
import { Montserrat_400Regular } from './../node_modules/@expo-google-fonts/montserrat/index.d';
import { FontsLoadProvider } from '~/utils/hooks/fontsLoad';

export default function Layout() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <FontsLoadProvider>
        <Stack>
          <Stack.Screen name="registrar" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs-stack)" options={{ headerShown: false }} />
        </Stack>
      </FontsLoadProvider>
    </QueryClientProvider>
  );
}
