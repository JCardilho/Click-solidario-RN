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
      <Stack.Screen name="create-reserve-donation" />
      <Stack.Screen name="(my-donations)" />
      <Stack.Screen name="one-reserve-donation" />
      <Stack.Screen name="my-reserves" />
      <Stack.Screen name="create-solicite-donation" />
      <Stack.Screen name="create-social-assistant" />
      <Stack.Screen name="all-social-assistants" />
    </Stack>
  );
}
