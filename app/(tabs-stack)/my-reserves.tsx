import { useQuery } from '@tanstack/react-query';
import { getYear } from 'date-fns';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Card } from '~/components/Card';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader } from '~/components/Loader';
import { NoneItemsScreen } from '~/components/NoneItemsScreen';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

export default function MyReservers() {
  const { user } = useCurrentUserHook();
  const router = useRouter();

  const { isPending, data, refetch, isRefetching } = useQuery<IReserveDonation[]>({
    queryKey: ['my-reservers-reserve-donations-page'],
    queryFn: async () => {
      if (!user || !user.uid) return [];
      try {
        const result = await ReserveDonationsService.GetMyReserves(user.uid);
        return result;
      } catch (err) {
        console.log('errr', err);
        return [];
      }
    },
  });

  useRefreshOnFocus(refetch);

  return (
    <>
      <HeaderBack title="Minhas reservas" />

      {data && data.length === 0 && <NoneItemsScreen />}

      <ScrollView className="w-full px-2">
        {/* <View className="w-full flex items-center">
            <Text className="text-4xl font-kanit">Minhas doações</Text>
            <Divider />
          </View> */}
        {/*   <Loader hiddenLoaderActive center isLoader={isPending} /> */}

        {isPending && (
          <View className="w-full mt-4">
            <Card isLoading={true} />
          </View>
        )}

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
              isFinished={
                item.reserve.endDateOfLastReserve &&
                getYear(item.reserve.endDateOfLastReserve) === 2100
              }
              hidden={{
                status: true,
              }}
              href={() => {
                router.push(
                  `/(tabs-stack)/one-reserve-donation/(view-reserve-donation)/${item.uid}`
                );
              }}
            />
          ))}
      </ScrollView>
    </>
  );
}
