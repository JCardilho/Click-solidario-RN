import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { HeaderBack } from '~/components/HeaderBack';

export default function EditOneReserveDonation() {
  const { uid } = useLocalSearchParams();

  return (
    <>
      <HeaderBack title="Editar item" />

      

      <ScrollView>
        <Text>Oi: {uid}</Text>
      </ScrollView>
    </>
  );
}
