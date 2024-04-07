import { useMutation, useQuery } from '@tanstack/react-query';
import { format, getYear } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNotifications } from 'react-native-notificated';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader, useLoaderHook } from '~/components/Loader';
import { useZoom } from '~/components/Zoom';
import { CancelReserve } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/cancel-reserve';
import { ExcludeReserve } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/exclude-reserve';
import { FinishReserveInViewReserveDonation } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/finish-reserve';
import { ReserveAction } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/reserve-action';
import { SavePostReserveDonationPage } from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/save-post';
import {
  ViewDataImageForViewReserveDonation,
  ViewDataTextForViewReserveDonation,
} from '~/layouts/reserve-donations/one-reserve-donation/(view-reserve-donation)/view-datas';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useReserveDonations } from '~/utils/hooks/screens/view-reserve-donation/view-reserve-donation';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { UserService } from '~/utils/services/UserService';

export default function ViewOneReserveDonation() {
  const { uid } = useLocalSearchParams();
  const { user } = useCurrentUserHook();
  const router = useRouter();
  const { setIsLoading } = useLoaderHook();
  const { searchViewReserveDonations, addViewReserveDonations, ViewReserveDonations } =
    useReserveDonations();
  const { notify } = useNotifications();
  const { ZoomView, ZoomTrigger } = useZoom();

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

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['create-chat'],
    mutationFn: async () => {
      console.log('vai passar pelo uid');
      if (
        !user ||
        !user.uid ||
        !data ||
        !data.name ||
        !data.images ||
        !data.ownerName ||
        !data.ownerUid
      )
        return;

      const donation_owner_uid = `&donation_owner_uid=${data.ownerUid}`;
      const receives_donation_uid = `&receives_donation_uid=${data.reserve.endOwnerUidOfLastReserve}`;
      const receives_donation_name = `&receives_donation_name=${data.reserve.endOwnerNameOfLastReserve}`;
      const donation_owner_name = `&donation_owner_name=${data.ownerName}`;

      const routeQueryWithoutCurrentUser = `${donation_owner_uid}${receives_donation_uid}${receives_donation_name}${donation_owner_name}`;

      const result = await UserService.CreateConversation(data.ownerUid, {
        routeQuery: `?current_user_uid=${data.ownerUid}${routeQueryWithoutCurrentUser}`,
        isNotification: true,
        otherUserName: data.reserve.endOwnerNameOfLastReserve || '',
        otherUserUid: data.reserve.endOwnerUidOfLastReserve || '',
        fromMessage: `${data.name}`,
      });

      await UserService.CreateConversation(data.reserve.endOwnerUidOfLastReserve || '', {
        routeQuery: `?current_user_uid=${data.reserve.endOwnerUidOfLastReserve}${routeQueryWithoutCurrentUser}`,
        isNotification: true,
        otherUserName: data.ownerName,
        otherUserUid: data.ownerUid,
        fromMessage: `${data.name}`,
      });

      return result;
    },
    onSuccess: async () => {
      if (!user) return;
      if (
        !user ||
        !user.uid ||
        !data ||
        !data.name ||
        !data.images ||
        !data.ownerName ||
        !data.ownerUid
      )
        return;

      const donation_owner_uid = `&donation_owner_uid=${data.ownerUid}`;
      const receives_donation_uid = `&receives_donation_uid=${data.reserve.endOwnerUidOfLastReserve}`;
      const receives_donation_name = `&receives_donation_name=${data.reserve.endOwnerNameOfLastReserve}`;
      const donation_owner_name = `&donation_owner_name=${data.ownerName}`;

      const routeQueryWithoutCurrentUser = `${donation_owner_uid}${receives_donation_uid}${receives_donation_name}${donation_owner_name}`;
      notify('warning', {
        params: {
          title: 'Um chat foi criado para você e para a outra pessoa!',
          description: '',
        },
      });
      const link = `/(tabs-stack)/one-reserve-donation/(chat-reserve-donation)/${uid}?current_user_uid=${user.uid}${routeQueryWithoutCurrentUser}`;
      router.push(link as any);
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
      <ZoomView />
      <ScrollView className="w-full p-2 flex flex-col gap-4 pb-12">
        {data && (
          <>
            <ViewDataImageForViewReserveDonation data={data} ZoomTrigger={ZoomTrigger} />
            <View className="w-full flex flex-col gap-2 mb-4">
              <ViewDataTextForViewReserveDonation data={data} />

              {data.reserve && (
                <>
                  {data.reserve.endDateOfLastReserve &&
                    new Date() < data.reserve.endDateOfLastReserve && (
                      <View
                        className={`w-full flex flex-col p-2 border rounded-lg gap-4 ${data.reserve.endDateOfLastReserve && getYear(data.reserve.endDateOfLastReserve) === 2100 ? 'bg-green-100 border-green-500' : 'bg-white border-zinc-200'}`}>
                        <View className="w-fit flex items-center">
                          <Badge icon="handshake-o" colorIcon="white">
                            {data.reserve.endDateOfLastReserve &&
                            getYear(data.reserve.endDateOfLastReserve) === 2100
                              ? 'Reserva finalizada!!'
                              : 'Reservado!!'}
                          </Badge>
                        </View>
                        <Text className="font-kanit">
                          Proprietario da reserva:{' '}
                          <Text className="underline">
                            {data.reserve.endOwnerNameOfLastReserve}
                          </Text>
                        </Text>
                        {data.reserve.endDateOfLastReserve &&
                          getYear(data.reserve.endDateOfLastReserve) !== 2100 && (
                            <>
                              <Text className="font-kanit">
                                Reserva até:{' '}
                                {format(data.reserve.endDateOfLastReserve, 'dd-MM-yyyy HH:mm')}
                              </Text>
                            </>
                          )}
                      </View>
                    )}
                </>
              )}
            </View>

            <SavePostReserveDonationPage data={data} />

            {user && !user.socialAssistant && (
              <View className="w-full flex flex-col gap-2">
                {(user?.uid === data.ownerUid || user.administrator) && (
                  <>
                    {data.reserve &&
                      data.reserve.endDateOfLastReserve &&
                      new Date() < data.reserve.endDateOfLastReserve && (
                        <>
                          <Button
                            variant="default"
                            icon={{
                              name: 'handshake-o',
                              color: 'white',
                              size: 15,
                            }}
                            onPress={async () => await mutateAsync()}
                            isLoading={isPending}>
                            Entrar no chat
                          </Button>
                        </>
                      )}

                    {data.reserve &&
                      data.reserve.endDateOfLastReserve &&
                      getYear(data.reserve.endDateOfLastReserve) !== 2100 && (
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
                      )}
                    <FinishReserveInViewReserveDonation uid={uid} refetch={refetch} data={data} />
                    <ExcludeReserve uid={uid} refetch={refetch} data={data} />
                  </>
                )}

                {user?.uid !== data.ownerUid && (
                  <>
                    <ReserveAction uid={uid} refetch={refetch} data={data} />
                  </>
                )}

                {data.reserve &&
                  user &&
                  data.reserve.endOwnerUidOfLastReserve &&
                  data.reserve.endOwnerUidOfLastReserve === user.uid &&
                  data.reserve.endOwnerNameOfLastReserve === user.name && (
                    <Button
                      variant="default"
                      icon={{
                        name: 'handshake-o',
                        color: 'white',
                        size: 15,
                      }}
                      onPress={async () => await mutateAsync()}
                      isLoading={isPending}>
                      Entrar em contato
                    </Button>
                  )}

                {data.reserve.endDateOfLastReserve &&
                  new Date() < data.reserve.endDateOfLastReserve &&
                  getYear(data.reserve.endDateOfLastReserve) !== 2100 && (
                    <CancelReserve uid={uid} refetch={refetch} data={data} />
                  )}
              </View>
            )}
          </>
        )}

        <View className="w-full h-[150px]"></View>
      </ScrollView>
    </>
  );
}
