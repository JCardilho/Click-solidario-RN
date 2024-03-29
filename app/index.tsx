import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Loader } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import * as Network from 'expo-network';
import { Button } from '~/components/Button';

export default function InitialPage() {
  const { user, verifyUserAndSendUserFromHome } = useCurrentUserHook();
  const router = useRouter();

  const verify = async () => {
    await verifyUserAndSendUserFromHome();
  };

  const verifyNetwork = async () => {
    const result = await Network.getNetworkStateAsync();
    if (!result.isConnected) return 'Sem conexão com a internet';
    return 'OK';
  };

  const {
    refetch: verifyUser,
    data,
    isLoading,
  } = useQuery({
    queryKey: ['verify-user-funcction'],
    queryFn: async () => {
      /*    const teste = async () => {
          try {
            await DeleteCache('user');
            if (await getCache('user')) return;
            await DeleteCache('user');
          } catch (err) {
            await DeleteCache('user');
          }
        };
        teste();  */
      if (user) return verifyNetwork();
      const result = await verifyNetwork();
      if (result !== 'OK') return result;
      verify();

      return 'OK';
    },
    enabled: true,
  });

  useRefreshOnFocus(verifyUser);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {isLoading && (
        <View className="w-full h-screen items-center justify-center">
          <Loader />
        </View>
      )}

      {data === 'Sem conexão com a internet' && (
        <View className="w-full h-screen items-center justify-center">
          <Text className="font-kanit">Sem conexão com a internet</Text>
          <Button onPress={verifyUser}>Tentar novamente</Button>
        </View>
      )}
    </>
  );
}
