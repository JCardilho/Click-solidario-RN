import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '~/components/Button';

export const DefaultInformationsForReserveDonationsPage = () => {
  const [show, setShow] = useState<boolean>();

  const handleShowInCache = async () => {
    try {
      const cache = await AsyncStorage.getItem('showDefaultInformationsForReserveDonationsPage');
      if (cache && (cache == 'true' || cache == 'false')) {
        setShow(cache == 'true' ? true : false);
        return;
      }
      setShow(true);
    } catch (err) {
      console.error(err);
      setShow(true);
    }
  };

  const handleHiddenInCache = async () => {
    try {
      await AsyncStorage.setItem('showDefaultInformationsForReserveDonationsPage', 'false');
      setShow(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleShowInCache();
  }, []);

  return (
    <>
      {show === true && (
        <View className="w-full bg-yellow-100/100 p-2 border border-yellow-400 rounded-lg mb-4">
          <Text className="text-xl font-kanit text-center">
            Utilize essa tela para disponibilizar itens à doação ou reservar itens disponíveis
          </Text>

          <View className="w-full flex flex-row gap-2 justify-between">
            <Button
              variant="ghost"
              icon={{
                name: 'close',
                color: 'black',
                size: 15,
              }}
              className="p-1 mt-2"
              onPress={handleHiddenInCache}>
              Fechar
            </Button>
            <Button
              variant="borded"
              icon={{
                name: 'info',
                color: 'black',
                size: 15,
              }}
              borderVariant="border-yellow-300"
              className="py-1 px-2 mt-2">
              Saber mais
            </Button>
          </View>
        </View>
      )}
    </>
  );
};
