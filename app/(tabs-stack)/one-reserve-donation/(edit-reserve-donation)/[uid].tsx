import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { HeaderBack } from '~/components/HeaderBack';

export default function EditOneReserveDonation() {
  const { uid_edit } = useLocalSearchParams();

  return (
    <>
      <HeaderBack title="Editar item" />

      <Stack.Screen
        name="[uid]"
        options={{
          headerShown: false,
        }}
      />

      <ScrollView>
        <Text>Oi: {uid_edit}</Text>
      </ScrollView>
    </>
  );
}
