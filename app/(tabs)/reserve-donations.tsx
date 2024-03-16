import { Feather, FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/Button';
import firebase from '~/utils/firebase';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import Logo from '~/assets/icon/logo.png';
import { useQuery } from '@tanstack/react-query';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { addMilliseconds, format } from 'date-fns';
import { DefaultInformationsForReserveDonationsPage } from '~/layouts/reserve-donations/default-informations';
import { Input } from '~/components/Input';
import { Card } from '~/components/Card';
import { useFocusEffect } from '@react-navigation/native';

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  const firstTimeRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      refetch();
    }, [refetch])
  );
}

export default function ReserveDonations() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { getCache, setCache } = useCacheHook();

  const { data, isLoading, refetch, isRefetching } = useQuery<IReserveDonation[]>({
    queryKey: ['request-donations'],
    queryFn: async () => {
      const result = await ReserveDonationsService.GetAllReserveDonations();
      return result;
    },
  });

  useRefreshOnFocus(refetch);

  return (
    <>
      <SafeAreaView />
      <ScrollView
        className="w-full p-4 flex flex-col gap-4"
        style={{
          gap: 4,
        }}>
        <View className="w-full  rounded-xl flex flex-col gap-4 p-4 items-center justify-center my-4">
          <FontAwesome name="dropbox" size={50} />
          {/*  <Image source={Logo} className="w-20 h-20 rounded-full" alt="background-image" /> */}

          <Text className="text-4xl font-kanit text-center">Reservar / Disponibilizar doação</Text>
        </View>

        <DefaultInformationsForReserveDonationsPage />

        <Button
          variant="default"
          icon={{
            name: 'user',
            color: 'white',
            size: 15,
          }}
          className="mb-2"
          href={() => router.push('/(tabs-stack)/(my-donations)/reserve-donations')}>
          Minhas doações
        </Button>
        <Button
          variant="default"
          icon={{
            name: 'plus',
            color: 'white',
            size: 15,
          }}
          href={() => router.push('/(tabs-stack)/create-reserve-donation')}
          className="mb-2">
          Disponibilizar um item à doação
        </Button>

        <View className="h-1 w-full bg-zinc-300 rounded-lg my-4"></View>
        <Text className="text-4xl font-kanit my-6">Itens disponibilizados:</Text>

        <View className="w-full flex flex-row gap-1">
          <Input label="" placeholder="Pesquisar" className="w-[85%]" />
          <Button variant="default" className="mt-6 px-5">
            <FontAwesome name="search" size={15} color="white" />
          </Button>
        </View>

        {isLoading && (
          <View className="w-full flex items-center justify-center">
            <ActivityIndicator size="large" color={'#023E8A'} />
          </View>
        )}

        {!isLoading &&
          data &&
          data.map((item, index) => (
            <Card
              key={`${item.uid}-reserve-donations-${index}`}
              item={{
                createdAt: item.createdAt,
                id: item.uid,
                name: item.name,
                description:
                  item.description && item.description.length > 300
                    ? item.description.substring(0, 300) + '...'
                    : item.description,
                images: item.images as string[],
                ownerName: item.ownerName,
              }}
              hidden={{
                status: true,
              }}
              href={() =>
                router.push(
                  `/(tabs-stack)/one-reserve-donation/(view-reserve-donation)/${item.uid}`
                )
              }
            />
          ))}

        <View className="my-12"></View>
      </ScrollView>
    </>
  );
}
