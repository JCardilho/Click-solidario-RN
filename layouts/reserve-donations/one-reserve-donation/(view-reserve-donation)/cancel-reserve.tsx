import { useMutation } from '@tanstack/react-query';
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

export const CancelReserve = ({ uid, refetch, data }: IProps) => {
  const { user } = useCurrentUserHook();
  const {
    stopLoadingForReactQueryError,
    mutation: { startLoadingForUseMutation },
    stopLoadingForReactQuerySuccess,
  } = useLoaderHook();

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
    ...stopLoadingForReactQueryError,
    ...startLoadingForUseMutation,
    ...stopLoadingForReactQuerySuccess,
  });

  return (
    <>
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
    </>
  );
};
