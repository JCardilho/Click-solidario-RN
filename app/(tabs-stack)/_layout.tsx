import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { Text } from 'react-native';

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="create-donation-items" />
    </Stack>
  );
}
