import { useMutation, useQuery } from '@tanstack/react-query';
import { addMilliseconds, differenceInDays, format } from 'date-fns';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Divider } from '~/components/Divider';
import { HeaderBack } from '~/components/HeaderBack';
import { Loader } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

export default function ViewOneReserveDonation() {
  const { uid } = useLocalSearchParams();
  const { user } = useCurrentUserHook();
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery<IReserveDonation>({
    queryKey: ['reserve-donation', uid],
    queryFn: async () => {
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      if (!uidFormatted) throw new Error('UID não encontrado');
      const result = await ReserveDonationsService.GetOneReserveDonation(uidFormatted);
      if (!result) throw new Error('Reserva não encontrada');
      return result;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ['reserve', uid],
    mutationFn: async () => {
      console.log('começou');
      if (!user || !user.uid || !uid) throw new Error('Usuário não encontrado');
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      const result = await ReserveDonationsService.ReserveDonationAction(uidFormatted, {
        endOwnerNameOfLastReserve: user.name,
        endOwnerUidOfLastReserve: user.uid,
      });
      return result;
    },
    onSuccess: async (data) => {
      refetch();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { mutate: mutateCancelReserve, isPending: isPendinCancelReserve } = useMutation({
    mutationKey: ['cacel-reserve', uid],
    mutationFn: async () => {
      console.log('começou a cancelar');
      if (!user || !user.uid || !uid) throw new Error('Usuário não encontrado');
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      const result = await ReserveDonationsService.RemoveReserveAction(uidFormatted);
      await refetch();
      return result;
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { mutate: mutateExcludeReserveDonation, isPending: isPendingExcludeReserveDonation } =
    useMutation({
      mutationKey: ['exclude-reserve-donation', uid],
      mutationFn: async () => {
        console.log('começou a excluir');
        if (!uid) throw new Error('UID não encontrado');
        if (!user) throw new Error('Usuário não encontrado');
        const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
        if (user.uid !== data?.ownerUid) throw new Error('Usuário não é o proprietário da reserva');
        const result = await ReserveDonationsService.ExcludeReserveDonation(uidFormatted);
        return result;
      },
      onSuccess: async () => {
        router.back();
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

      <Loader
        center
        hiddenLoaderActive
        isLoader={
          isLoading ||
          isPending ||
          isRefetching ||
          isPendinCancelReserve ||
          isPendingExcludeReserveDonation
        }
      />

      <ScrollView className="w-full p-2 flex flex-col gap-4 pb-12">
        {data &&
          !isLoading &&
          !isPending &&
          !isRefetching &&
          !isPendinCancelReserve &&
          !isPendingExcludeReserveDonation && (
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
              <View className="w-full flex flex-col gap-2 mb-4">
                <View className="w-full p-4 border border-primary rounded-lg flex items-center justify-center">
                  <Text className="font-kanit text-2xl">Nome: {data.name}</Text>
                </View>
                <Text className="font-kanit text-lg">Descrição: </Text>
                <Text className="font-kanit text-lg text-justify p-2 bg-white border border-zinc-200 rounded-lg">
                  {data.description}
                </Text>
                <Divider />
                <Text className="font-kanit text-lg">Proprietário: {data.ownerName}</Text>
                <Text className="font-kanit text-lg">
                  Criado em: {data.createdAt.toLocaleString('pt-BR')}
                </Text>
                <Divider />

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
                    <Button
                      variant="destructive"
                      icon={{
                        name: 'trash-o',
                        color: 'white',
                        size: 15,
                      }}
                      isLoading={isPendingExcludeReserveDonation}
                      onPress={() => mutateExcludeReserveDonation()}>
                      Excluir
                    </Button>
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

                    {(data.reserve.endDateOfLastReserve &&
                      new Date() > data.reserve.endDateOfLastReserve) ||
                      (!data.reserve.endDateOfLastReserve && (
                        <Button
                          variant="success"
                          icon={{
                            name: 'handshake-o',
                            color: 'white',
                            size: 15,
                          }}
                          isLoading={isPending}
                          onPress={() => mutate()}>
                          Reservar
                        </Button>
                      ))}
                  </>
                )}

                {data.reserve &&
                  user &&
                  data.reserve.endOwnerUidOfLastReserve &&
                  data.reserve.endOwnerUidOfLastReserve === user.uid &&
                  data.reserve.endOwnerNameOfLastReserve === user.name && (
                    <>
                      <Button
                        variant="destructive"
                        icon={{
                          name: 'close',
                          color: 'white',
                          size: 15,
                        }}
                        isLoading={isPendinCancelReserve}
                        onPress={() => mutateCancelReserve()}>
                        Cancelar Reserva
                      </Button>
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
