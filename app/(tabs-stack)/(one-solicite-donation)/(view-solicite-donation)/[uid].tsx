import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useNotifications } from 'react-native-notificated';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader, useLoaderHook } from '~/components/Loader';
import { ExcludeSoliccite } from '~/layouts/solicite-donations/(view-solicite-donation)/exclude-solicite';
import { FinishReserveInViewSoliciteDonation } from '~/layouts/solicite-donations/(view-solicite-donation)/finish-solicite';
import {
  ViewDataHelpedListForViewSoliciteDonation,
  ViewDataImageForViewSoliciteDonation,
  ViewDataTextForViewSoliciteDonation,
} from '~/layouts/solicite-donations/one-solicite-donation/view-data';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';
import { UserService } from '~/utils/services/UserService';

export default function ViewOneSoliciteDonation() {
  const { uid } = useLocalSearchParams();
  const { user, findOneConversation } = useCurrentUserHook();
  const router = useRouter();
  const { setIsLoading } = useLoaderHook();

  const { notify } = useNotifications();

  const { data, refetch, isLoading, isRefetching } = useQuery<ISoliciteDonation>({
    queryKey: ['solicite-donation', uid],
    queryFn: async () => {
      setIsLoading(true);
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      if (!uidFormatted) throw new Error('UID não encontrado');
      const result = await SoliciteDonationsSerivce.GetOneSoliciteDonations(uidFormatted);
      if (!result) throw new Error('Reserva não encontrada');
      setIsLoading(false);
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
        return 'ERR';

      const result = await UserService.CreateConversation(user.uid, {
        routeQuery: `?current_user_uid=${user.uid}&donation_owner_uid=${user.uid}&receives_donation_uid=${data.ownerUid}&receives_donation_name=${data.ownerName}&donation_owner_name=${user.name}`,
        isNotification: true,
        otherUserName: data.ownerName,
        otherUserUid: data.ownerUid,
        fromMessage: `${data.name}`,
      });

      await UserService.CreateConversation(data.ownerUid || '', {
        routeQuery: `?current_user_uid=${data.ownerUid}&donation_owner_uid=${user.uid}&receives_donation_uid=${data.ownerUid}&receives_donation_name=${data.ownerName}&donation_owner_name=${user.name}`,
        isNotification: true,
        otherUserName: user.name!,
        otherUserUid: user.uid,
        fromMessage: `${data.name}`,
      });

      return result;
    },
    onSuccess: async () => {
      if (!user) return;
      notify('warning', {
        params: {
          title: 'Um chat foi criado para você e para a outra pessoa!',
          description: '',
        },
      });
      const link = `/(tabs-stack)/one-reserve-donation/(chat-reserve-donation)/${uid}?current_user_uid=${user.uid}&donation_owner_uid=${user.uid}&receives_donation_uid=${data!.ownerUid}&receives_donation_name=${data!.ownerName}&donation_owner_name=${user.name}`;
      router.push(link as any);
    },
  });

  /*   useEffect(() => {
    if (ViewReserveDonations.find((item) => item.uid === uid)) {
      refetch();
    }
  }, [ViewReserveDonations.find((item) => item.uid === uid)]); */

  useRefreshOnFocus(refetch);

  return (
    <>
      <HeaderBack title={`Reserva: ${data?.name}`} />
      <Loader fullscreen activeHook />
      <ScrollView className="w-full p-2 flex flex-col gap-4 pb-12">
        {data && !isLoading && !isRefetching && (
          <>
            <ViewDataImageForViewSoliciteDonation data={data} />
            <View className="w-full flex flex-col gap-2 ">
              <ViewDataTextForViewSoliciteDonation data={data} />
            </View>

            <ViewDataHelpedListForViewSoliciteDonation data={data} />

            <View className="w-full flex flex-col gap-2 mt-4">
              {user?.uid === data.ownerUid && (
                <>
                  {!data.isFinished && (
                    <Button
                      variant="default"
                      icon={{
                        name: 'paint-brush',
                        color: 'white',
                        size: 15,
                      }}
                      href={() => {
                        router.push(
                          `/(tabs-stack)/(one-solicite-donation)/(edit-solicite-donation)/${uid}`
                        );
                      }}>
                      Editar
                    </Button>
                  )}
                  <FinishReserveInViewSoliciteDonation uid={uid} refetch={refetch} data={data} />
                  <ExcludeSoliccite uid={uid} refetch={refetch} data={data} />
                </>
              )}

              {user && user.uid !== data.ownerUid && (
                <>
                  <Button
                    variant="default"
                    icon={{
                      name: 'comment',
                      color: 'white',
                      size: 15,
                    }}
                    onPress={async () => await mutateAsync()}
                    isLoading={isPending}>
                    Entrar em contato
                  </Button>
                  {user &&
                    user.uid &&
                    data.helpedList &&
                    !data.helpedList.find((item) => item.uid === user.uid) && (
                      <Button
                        variant="default"
                        icon={{
                          name: 'handshake-o',
                          color: 'white',
                          size: 15,
                        }}
                        onPress={async () => {
                          if (!user) return;
                          const verifyConversation = await findOneConversation(data.ownerUid);
                          if (!verifyConversation) {
                            notify('warning', {
                              params: {
                                title:
                                  'Você precisa conversar antes de registrar a sua assistência!',
                                description: '',
                              },
                            });
                            return;
                          }
                          router.push(
                            `/(tabs-stack)/(one-solicite-donation)/(register-assistence)/${uid}`
                          );
                        }}
                        isLoading={isPending}>
                        Registrar assistência
                      </Button>
                    )}
                </>
              )}
            </View>
          </>
        )}

        <View className="w-full h-[150px]"></View>
      </ScrollView>
    </>
  );
}
