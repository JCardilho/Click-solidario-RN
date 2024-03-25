import { useMutation } from '@tanstack/react-query';
import { useNotifications } from 'react-native-notificated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { useLoaderHook } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useReserveDonations } from '~/utils/hooks/screens/view-reserve-donation/view-reserve-donation';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

interface IProps {
  uid: string | string[];
  refetch: () => void;
  data: IReserveDonation;
}

export const CancelReserve = ({ uid, refetch, data }: IProps) => {
  const { user } = useCurrentUserHook();
  const {
    stopLoadingForReactQueryError,
    mutation: { startLoadingForUseMutation },
    stopLoadingForReactQuerySuccess,
  } = useLoaderHook();
  const { setReserve } = useReserveDonations();
  const { notify } = useNotifications();

  const { mutate: mutateCancelReserve, isPending: isPendinCancelReserve } = useMutation({
    mutationKey: ['cacel-reserve', uid],
    mutationFn: async () => {
      console.log('começou a cancelar');
      if (!user || !user.uid || !uid) throw new Error('Usuário não encontrado');
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      const result = await ReserveDonationsService.RemoveReserveAction(uidFormatted);
      setReserve(
        {
          endDateOfLastReserve: undefined,
          endOwnerNameOfLastReserve: undefined,
          endOwnerUidOfLastReserve: undefined,
        },
        uidFormatted
      );
      notify('success', {
        params: {
          title: 'Reserva cancelada com sucesso!',
          description: 'A reserva foi cancelada com sucesso',
        },
      });
      await refetch();
      return result;
    },
    ...stopLoadingForReactQueryError,
    ...startLoadingForUseMutation,
    ...stopLoadingForReactQuerySuccess,
  });

  const { BottomSheet, open } = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => {
        mutateCancelReserve();
      },
      isLoading: isPendinCancelReserve,
      variant: 'destructive',
    },
    textNeedConfirm: 'Você cancelar essa reserva?',
  });

  return (
    <>
      {data.reserve &&
        user &&
        data.reserve.endOwnerUidOfLastReserve &&
        data.reserve.endOwnerUidOfLastReserve === user.uid &&
        data.reserve.endOwnerNameOfLastReserve === user.name && (
          <>
            <BottomSheet />
            <Button
              variant="destructive"
              icon={{
                name: 'close',
                color: 'white',
                size: 15,
              }}
              isLoading={isPendinCancelReserve}
              onPress={() => open()}>
              Cancelar Reserva
            </Button>
          </>
        )}
    </>
  );
};
