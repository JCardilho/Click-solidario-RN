import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { Kanit_400Regular, useFonts } from './../../node_modules/@expo-google-fonts/kanit/index';
import { FontAwesome } from '@expo/vector-icons';
import { Button } from '~/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectImage } from '~/layouts/profile/select-image';
import { useMutation } from '@tanstack/react-query';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user } = useCurrentUserHook();
  const [greeting, setGreeting] = useState('');
  const currentHour = new Date().getHours();
  const { setCache } = useCacheHook();
  const router = useRouter();

  useEffect(() => {
    if (currentHour >= 5 && currentHour < 12) {
      setGreeting('Bom dia');
    } else if (currentHour >= 12 && currentHour < 18) {
      setGreeting('Boa tarde');
    } else if (currentHour >= 18 && currentHour < 24) {
      setGreeting('Boa noite');
    } else {
      setGreeting('Boa madrugada');
    }
  }, []);

  const { isPending, mutate: LogOut } = useMutation({
    mutationKey: ['log-out'],
    mutationFn: async () => {
      await setCache('user', null);
      router.push('/entrar');
    },
  });

  return (
    user && (
      <View className="p-4 flex flex-col gap-4">
        <SafeAreaView />
        <Text className=" font-bold text-4xl font-montserrat">Perfil</Text>
        <View className="w-full flex  p-4 border-zinc-300 shadow-black bg-white shadow-2xl rounded-lg border-2">
          <SelectImage />
          <Text className="font-kanit text-2xl">
            {greeting}, {user?.name}
          </Text>
          <Text className="font-kanit text-lg">Email: {user.email}</Text>
        </View>
        {user && !user.socialAssistant && (
          <Button icon={{ name: 'paint-brush', color: 'white', size: 15 }} variant="default">
            Editar Perfil
          </Button>
        )}
        {user.administrator && (
          <>
            <Button
              icon={{
                name: 'heart-o',
                color: 'white',
                size: 15,
              }}
              variant="default"
              href={() => router.push('/create-social-assistant')}>
              Cadastrar assitente social
            </Button>

            <Button
              icon={{
                name: 'heart-o',
                color: 'white',
                size: 15,
              }}
              variant="default"
              href={() => router.push('/all-social-assistants')}>
              Exibir assistentes sociais
            </Button>

            <Button
              variant="default"
              icon={{
                name: 'shield',
                color: 'white',
                size: 15,
              }}>
              Cadastrar administrador
            </Button>
          </>
        )}
        <Button
          icon={{
            name: 'sign-out',
            color: 'white',
            size: 15,
          }}
          variant="destructive"
          isLoading={isPending}
          onPress={() => LogOut()}>
          Sair
        </Button>
      </View>
    )
  );
}
