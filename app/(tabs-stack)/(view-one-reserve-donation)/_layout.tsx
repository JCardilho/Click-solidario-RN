import { Stack } from 'expo-router';

export default function _LayoutViewOneReserveDonation() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="[uid]" getId={({ params }) => String(Date.now())} />
    </Stack>
  );
}
