import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useNotifications } from 'react-native-notificated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { useLoaderHook } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

interface IProps {
  uid: string | string[];
  refetch: () => void;
  data: IReserveDonation;
}

export const ExcludeReserve = ({ uid, refetch, data }: IProps) => {
  const { user } = useCurrentUserHook();
  const router = useRouter();
  const {
    stopLoadingForReactQueryError,
    mutation: { startLoadingForUseMutation },
    setIsLoading,
  } = useLoaderHook();
  const { notify } = useNotifications();

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
        setIsLoading(false);
        notify('success', {
          params: {
            title: 'Reserva excluída com sucesso',
            description: 'A reserva foi excluída com sucesso!',
          },
        });
        router.back();
      },
      ...stopLoadingForReactQueryError,
      ...startLoadingForUseMutation,
    });

  const { BottomSheet, open } = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => {
        mutateExcludeReserveDonation();
      },
      isLoading: isPendingExcludeReserveDonation,
      variant: 'destructive',
    },
    textNeedConfirm: 'Você deseja confirmar essa exclusão?',
  });

  return (
    <>
      <BottomSheet />
      <Button
        variant="destructive"
        icon={{
          name: 'trash-o',
          color: 'white',
          size: 15,
        }}
        isLoading={isPendingExcludeReserveDonation}
        onPress={() => open()}>
        Excluir
      </Button>
    </>
  );
};
