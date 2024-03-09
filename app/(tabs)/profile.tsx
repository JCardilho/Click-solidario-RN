import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { Kanit_400Regular, useFonts } from './../../node_modules/@expo-google-fonts/kanit/index';
import { FontAwesome } from '@expo/vector-icons';
import { Button } from '~/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { user } = useCurrentUserHook();
  const [greeting, setGreeting] = useState('');
  const currentHour = new Date().getHours();

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

  return (
    user && (
      <View className="p-4 flex flex-col gap-4">
        <SafeAreaView />
        <Text className=" font-bold text-4xl font-montserrat">Perfil</Text>
        <View className="w-full flex  p-4 border-zinc-300 shadow-black bg-white shadow-2xl rounded-lg border-2">
          <Text className="font-kanit text-2xl">
            {greeting}, {user?.name}
          </Text>
          <Text className="font-kanit text-lg">Email: {user.email}</Text>
        </View>
        <Button icon={{ name: 'paint-brush', color: 'white', size: 15 }} variant="default">
          Editar Perfil
        </Button>
        {user.administrator && (
          <>
            <Button
              icon={{
                name: 'heart-o',
                color: 'white',
                size: 15,
              }}
              variant="default">
              Cadastrar assitente social
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
          variant="destructive">
          Sair
        </Button>
      </View>
    )
  );
}
