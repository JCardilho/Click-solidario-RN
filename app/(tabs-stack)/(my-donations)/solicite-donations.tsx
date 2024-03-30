import { useMutation, useQuery } from '@tanstack/react-query';
import { getYear } from 'date-fns';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '~/components/Card';
import { Divider } from '~/components/Divider';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

export default function MyDonationsInSoliciteDonationsPage() {
  const { user } = useCurrentUserHook();
  const router = useRouter();

  const { isPending, data, refetch } = useQuery<ISoliciteDonation[]>({
    queryKey: ['my-solicite-donations'],
    queryFn: async () => {
      if (!user || !user.uid) return [];
      const result = await SoliciteDonationsSerivce.GetMySoliciteDonations(user.uid);
      return result;
    },
  });

  useRefreshOnFocus(refetch);

  return (
    <>
      <HeaderBack title="Minhas solicitações" />

      <ScrollView className="w-full px-2">
        {/* <View className="w-full flex items-center">
          <Text className="text-4xl font-kanit">Minhas doações</Text>
          <Divider />
        </View> */}
        {/*  <Loader hiddenLoaderActive center isLoader={isPending} /> */}

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
              isFinished={item.isFinished}
              hidden={{
                ownerName: true,
                status: true,
              }}
              href={() => {
                router.push(
                  `/(tabs-stack)/(one-solicite-donation)/(view-solicite-donation)/${item.uid}`
                );
              }}
            />
          ))}
      </ScrollView>
    </>
  );
}
