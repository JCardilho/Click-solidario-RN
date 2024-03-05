import { Text, View } from 'react-native';
import { useCurrentUser } from '~/utils/hooks/currentUser';

export default function Profile() {
  const { user } = useCurrentUser();

  return (
    <View>
      <Text>Profile</Text>
      <Text>Olá, {user?.email}</Text>
    </View>
  );
}
