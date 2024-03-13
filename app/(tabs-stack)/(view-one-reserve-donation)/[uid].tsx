import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader } from '~/components/Loader';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

export default function ViewOneReserveDonation() {
  const { uid } = useLocalSearchParams();

  const { data, isLoading } = useQuery<IReserveDonation>({
    queryKey: ['reserve-donation', uid],
    queryFn: async () => {
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      const result = await ReserveDonationsService.GetOneReserveDonation(uidFormatted);
      if (!result) throw new Error('Reserva não encontrada');
      return result;
    },
  });

  return (
    <>
      <HeaderBack title={`Reserva: ${data?.name}`} />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <Loader center hiddenLoaderActive isLoader={isLoading} />

      <ScrollView className="w-full p-2 flex flex-col gap-4">
        {data && (
          <>
            {data.images && data.images.length > 0 && (
              <>
                <Text className="font-kanit">Imagens: </Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
                  {data.images.map((image: any) => (
                    <TouchableOpacity key={image}>
                      <Image
                        source={{ uri: image }}
                        className="w-[150px] h-[150px] rounded-lg border-2 border-primary m-2"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
            <View className="w-full p-4 border border-primary rounded-lg flex items-center justify-center mb-2">
              <Text className="font-kanit text-2xl">Nome: {data.name}</Text>
            </View>
            <Text>{data.description}</Text>
          </>
        )}
      </ScrollView>
    </>
  );
}
