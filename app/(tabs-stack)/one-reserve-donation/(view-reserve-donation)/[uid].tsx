import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader, useLoaderHook } from '~/components/Loader';
import { CancelReserve } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/cancel-reserve';
import { ExcludeReserve } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/exclude-reserve';
import { ReserveAction } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/reserve-action';
import {
  ViewDataImageForViewReserveDonation,
  ViewDataTextForViewReserveDonation,
} from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/view-datas';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useReserveDonations } from '~/utils/hooks/screens/view-reserve-donation/view-reserve-donation';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

export default function ViewOneReserveDonation() {
  const { uid } = useLocalSearchParams();
  const { user } = useCurrentUserHook();
  const router = useRouter();
  const { setIsLoading } = useLoaderHook();
  const { searchViewReserveDonations, addViewReserveDonations, ViewReserveDonations } =
    useReserveDonations();

  const { data, refetch } = useQuery<IReserveDonation>({
    queryKey: ['reserve-donation', uid],
    queryFn: async () => {
      setIsLoading(true);
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      if (!uidFormatted) throw new Error('UID não encontrado');
      const searchForData = searchViewReserveDonations(uidFormatted);
      if (searchForData) {
        setIsLoading(false);
        return searchForData;
      }
      const result = await ReserveDonationsService.GetOneReserveDonation(uidFormatted);
      if (!result) throw new Error('Reserva não encontrada');
      setIsLoading(false);
      addViewReserveDonations(result);
      return result;
    },
  });

  useEffect(() => {
    if (ViewReserveDonations.find((item) => item.uid === uid)) {
      refetch();
    }
  }, [ViewReserveDonations.find((item) => item.uid === uid)]);

  return (
    <>
      <HeaderBack title={`Reserva: ${data?.name}`} />
      <Loader fullscreen activeHook />
      <ScrollView className="w-full p-2 flex flex-col gap-4 pb-12">
        {data && (
          <>
            <ViewDataImageForViewReserveDonation data={data} />
            <View className="w-full flex flex-col gap-2 mb-4">
              <ViewDataTextForViewReserveDonation data={data} />

              {data.reserve && (
                <>
                  {data.reserve.endDateOfLastReserve &&
                    new Date() < data.reserve.endDateOfLastReserve && (
                      <View className="w-full flex flex-col p-2 bg-white border-zinc-200 border rounded-lg gap-4">
                        <View className="w-fit flex items-center">
                          <Badge icon="handshake-o" colorIcon="white">
                            Reservado!!
                          </Badge>
                        </View>
                        <Text className="font-kanit">
                          Proprietario da reserva:{' '}
                          <Text className="underline">
                            {data.reserve.endOwnerNameOfLastReserve}
                          </Text>
                        </Text>
                        <Text className="font-kanit">
                          Reserva até:{' '}
                          {format(data.reserve.endDateOfLastReserve, 'dd-MM-yyyy HH:mm')}
                        </Text>
                      </View>
                    )}
                </>
              )}
            </View>
            <View className="w-full flex flex-col gap-2">
              {user?.uid === data.ownerUid && (
                <>
                  <Button
                    variant="default"
                    icon={{
                      name: 'paint-brush',
                      color: 'white',
                      size: 15,
                    }}
                    href={() =>
                      router.push(
                        `/(tabs-stack)/one-reserve-donation/(edit-reserve-donation)/${uid}`
                      )
                    }>
                    Editar
                  </Button>
                  <ExcludeReserve uid={uid} refetch={refetch} data={data} />
                </>
              )}

              {user?.uid !== data.ownerUid && (
                <>
                  <Button
                    variant="default"
                    icon={{
                      name: 'handshake-o',
                      color: 'white',
                      size: 15,
                    }}>
                    Entrar em contato
                  </Button>
                  <ReserveAction uid={uid} refetch={refetch} data={data} />
                </>
              )}
              <CancelReserve uid={uid} refetch={refetch} data={data} />
            </View>
          </>
        )}

        <View className="w-full h-[150px]"></View>
      </ScrollView>
    </>
  );
}
