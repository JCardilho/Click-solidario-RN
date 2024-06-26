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
      <Stack.Screen name="(view-solicite-donation)" />
      <Stack.Screen name="(edit-solicite-donation)" />
      <Stack.Screen name="(register-assistence)" />
    </Stack>
  );
}
