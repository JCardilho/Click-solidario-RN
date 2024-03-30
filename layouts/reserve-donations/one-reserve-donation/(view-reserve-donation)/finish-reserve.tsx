import { useMutation } from '@tanstack/react-query';
import { getYear } from 'date-fns';
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

export const FinishReserveInViewReserveDonation = (props: IProps) => {
  const { user } = useCurrentUserHook();
  const { notify } = useNotifications();
  const { setReserve } = useReserveDonations();

  const FinishReserveMutation = useMutation({
    mutationKey: ['finish-reserve', props.uid],
    mutationFn: async () => {
      if (
        !user ||
        !user.uid ||
        !props.uid ||
        !props.data.reserve.endOwnerUidOfLastReserve ||
        !props.data.reserve.endOwnerNameOfLastReserve
      )
        throw new Error('Usuário não encontrado');
      const newDate = await ReserveDonationsService.FinishReserve({
        uid: props.data.uid,
        endOwnerUidOfLastReserve: props.data.reserve.endOwnerUidOfLastReserve,
        endOwnerNameOfLastReserve: props.data.reserve.endOwnerNameOfLastReserve,
      });

      const uidFormatted = Array.isArray(props.uid) ? props.uid[0] : props.uid;
      setReserve(
        {
          ...props.data.reserve,
          endDateOfLastReserve: newDate,
        },
        uidFormatted
      );
    },
    onSuccess: async () => {
      notify('success', {
        params: {
          title: 'Reserva finalizada com sucesso!',
          description: 'Você pode voltar a reservar este item!',
        },
      });
      setTimeout(() => {
        props.refetch();
      }, 100);
    },
  });

  const FinishReserve = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => {
        FinishReserveMutation.mutate();
      },
      isLoading: FinishReserveMutation.isPending,
      variant: 'success',
    },
    textNeedConfirm: 'Você tem certeza que deseja finalizar a reserva?',
    descriptionNeedConfirm:
      'Caso volte a reservar, o usuário anterior ainda vai ter o item reservado por um dia!',
    snapPoints: ['50%', '75%', '95%'],
  });

  const UnFinishReserveMutation = useMutation({
    mutationKey: ['unfinish-reserve', props.uid],
    mutationFn: async () => {
      if (
        !user ||
        !user.uid ||
        !props.uid ||
        !props.data.reserve.endOwnerUidOfLastReserve ||
        !props.data.reserve.endOwnerNameOfLastReserve
      )
        throw new Error('Usuário não encontrado');
      const newDate = await ReserveDonationsService.UnFinishReserve({
        uid: props.data.uid,
        endOwnerNameOfLastReserve: props.data.reserve.endOwnerNameOfLastReserve,
        endOwnerUidOfLastReserve: props.data.reserve.endOwnerUidOfLastReserve,
      });

      const uidFormatted = Array.isArray(props.uid) ? props.uid[0] : props.uid;
      setReserve(
        {
          ...props.data.reserve,
          endDateOfLastReserve: newDate,
        },
        uidFormatted
      );
    },
    onSuccess: async () => {
      notify('success', {
        params: {
          title: 'Reserva disponível novamente',
          description: 'Você pode voltar a reservar este item!',
        },
      });
      setTimeout(() => {
        props.refetch();
      }, 100);
    },
  });

  const UnFinishReserve = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => {
        UnFinishReserveMutation.mutate();
      },
      isLoading: UnFinishReserveMutation.isPending,
      variant: 'success',
    },
    textNeedConfirm: 'Você tem certeza que deseja desfazer a finalização da reserva?',
    descriptionNeedConfirm:
      'Caso volte a reservar, o usuário anterior ainda vai ter o item reservado por um dia!',
    snapPoints: ['50%', '75%', '95%'],
  });

  return (
    <>
      <FinishReserve.BottomSheet />
      <UnFinishReserve.BottomSheet />
      {props.data.reserve.endDateOfLastReserve &&
      getYear(props.data.reserve.endDateOfLastReserve) === 2100 ? (
        <>
          <Button
            variant="default"
            onPress={() => {
              UnFinishReserve.open();
            }}
            isLoading={UnFinishReserveMutation.isPending}
            disabled={UnFinishReserveMutation.isPending}
            icon={{
              name: 'hourglass-start',
              color: 'white',
              size: 20,
            }}>
            Disponibilizar Reserva
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="success"
            onPress={() => {
              FinishReserve.open();
            }}
            isLoading={FinishReserveMutation.isPending}
            disabled={FinishReserveMutation.isPending}
            icon={{
              name: 'hourglass-3',
              color: 'white',
              size: 20,
            }}>
            Finalizar Reserva
          </Button>
        </>
      )}
    </>
  );
};
