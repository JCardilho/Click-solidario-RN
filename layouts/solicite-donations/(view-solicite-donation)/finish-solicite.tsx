import { useMutation } from '@tanstack/react-query';
import { useNotifications } from 'react-native-notificated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

interface IProps {
  data: ISoliciteDonation;
  uid?: string | string[];
  refetch: () => void;
}

export const FinishReserveInViewSoliciteDonation = (props: IProps) => {
  const { user } = useCurrentUserHook();
  const { notify } = useNotifications();

  const FinishReserveMutation = useMutation({
    mutationKey: ['finish-solicite', props.uid],
    mutationFn: async () => {
      if (!user || !user.uid || !props.uid) throw new Error('Usuário não encontrado');
      await SoliciteDonationsSerivce.FinishSolicite({
        uid: props.data.uid,
      });
    },
    onSuccess: async () => {
      notify('success', {
        params: {
          title: 'Solicitação finalizada com sucesso!',
          description: 'Você pode voltar a solicitar este item!',
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
    textNeedConfirm: 'Você tem certeza que deseja finalizar a solicitação?',
    snapPoints: ['50%', '75%', '95%'],
  });

  const UnFinishReserveMutation = useMutation({
    mutationKey: ['unfinish-solicite', props.uid],
    mutationFn: async () => {
      if (!user || !user.uid || !props.uid) throw new Error('Usuário não encontrado');
      await SoliciteDonationsSerivce.UnFinishSolicite({
        uid: props.data.uid,
      });
    },
    onSuccess: async () => {
      notify('success', {
        params: {
          title: 'Solicitação disponível novamente',
          description: 'Você pode voltar a solicitar este item!',
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
    textNeedConfirm: 'Você tem certeza que deseja desfazer a finalização da solicitação?',
    snapPoints: ['50%', '75%', '95%'],
  });

  return (
    <>
      <FinishReserve.BottomSheet />
      <UnFinishReserve.BottomSheet />
      {props.data.isFinished ? (
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
