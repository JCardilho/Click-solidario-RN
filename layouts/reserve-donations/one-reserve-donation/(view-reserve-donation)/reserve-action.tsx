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
  data: IReserveDonation;
  uid?: string | string[];
  refetch: () => void;
}

export const ReserveAction = ({ data, uid, refetch }: IProps) => {
  const { user } = useCurrentUserHook();
  const { notify } = useNotifications();

  const {
    stopLoadingForReactQueryError,
    mutation: { startLoadingForUseMutation },
    setIsLoading,
  } = useLoaderHook();
  const { setReserve } = useReserveDonations();

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
      setReserve(result, data.uid);
      return result;
    },
    onSuccess: async (data) => {
      setIsLoading(false);
      notify('success', {
        params: {
          title: 'Reserva confirmada com sucesso!',
          description: 'A reserva foi confirmada com sucesso',
        },
      });
      refetch();
    },
    ...stopLoadingForReactQueryError,
    ...startLoadingForUseMutation,
  });

  const { BottomSheet, open } = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => {
        setIsLoading(true);
        mutate();
      },
      isLoading: isPending,
    },
    textNeedConfirm: 'Você deseja confirmar essa reserva?',
  });

  return (
    <>
      {(data.reserve.endDateOfLastReserve && new Date() > data.reserve.endDateOfLastReserve) ||
        (!data.reserve.endDateOfLastReserve && (
          <>
            <BottomSheet />
            <Button
              variant="success"
              icon={{
                name: 'handshake-o',
                color: 'white',
                size: 15,
              }}
              isLoading={isPending}
              onPress={() => open()}>
              Reservar
            </Button>
          </>
        ))}
    </>
  );
};
