import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { Text } from 'react-native';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="(chat-reserve-donation)" />
      <Stack.Screen name="(edit-reserve-donation)" />
      <Stack.Screen name="(view-reserve-donation)" />
    </Stack>
  );
}
