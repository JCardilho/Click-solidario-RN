import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';

export default function Profile() {
  const { user } = useCurrentUserHook();

  return (
    user && (
      <View>
        <Text>Profile</Text>
        <Text>Olá, {user?.user.email}</Text>
      </View>
    )
  );
}
