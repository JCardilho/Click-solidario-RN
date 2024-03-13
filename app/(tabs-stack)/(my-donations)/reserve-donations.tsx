import { useMutation, useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '~/components/Card';
import { Divider } from '~/components/Divider';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

export default function MyDonationsInReserveDonationsPage() {
  const { user } = useCurrentUserHook();
  const router = useRouter();

  const { isPending, data } = useQuery<IReserveDonation[]>({
    queryKey: ['my-donations-reserve-donations'],
    queryFn: async () => {
      if (!user || !user.uid) return [];
      const result = await ReserveDonationsService.GetMyReserveDonations(user.uid);
      return result;
    },
  });

  return (
    <>
      <HeaderBack title="Reservar doações" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="w-full px-2">
        <View className="w-full flex items-center">
          <Text className="text-4xl font-kanit">Minhas doações</Text>
          <Divider />
        </View>
        <Loader hiddenLoaderActive center isLoader={isPending} />

        {data &&
          data.length > 0 &&
          data.map((item, index) => (
            <Card
              key={item.uid + index}
              item={{
                name: item.name,
                description: item.description,
                ownerName: item.ownerName,
                images: item.images as string[],
                createdAt: item.createdAt,
                id: item.uid,
              }}
              hidden={{
                ownerName: true,
                status: true,
              }}
              href={() => {
                router.push(`/(tabs-stack)/(view-one-reserve-donation)/${item.uid}`);
              }}
            />
          ))}
      </ScrollView>
    </>
  );
}
