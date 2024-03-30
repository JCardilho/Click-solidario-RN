import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Loader } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import * as Network from 'expo-network';
import { Button } from '~/components/Button';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
  useAnimatedRef,
} from 'react-native-reanimated';
import Logo from '~/assets/icon/logo.png';

export default function InitialPage() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAppIsReady(true);
    }, 3000);
  }, []);

  return appIsReady ? <InitialPageContet /> : <SplashScreen />;
}

const InitialPageContet = () => {
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
};

const SplashScreen = () => {
  const translateY = useSharedValue(100);
  const opacityRef = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(500, withSpring(0));
    opacityRef.value = withDelay(500, withSpring(1));
    setTimeout(() => {
      translateY.value = withSpring(100);
      opacityRef.value = withSpring(0);
    }, 2000);
  }, []);

  return (
    <View className="w-full h-screen items-center justify-center">
      <Animated.View
        style={[
          {
            transform: [{ translateY: translateY }],
            opacity: opacityRef,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <Image source={Logo} className="w-40 h-40 p-4" alt="background-image" />
        <Text className="text-4xl font-montserrat font-bold uppercase text-center text-primary">
          Click Solidário!
        </Text>
      </Animated.View>
    </View>
  );
};
