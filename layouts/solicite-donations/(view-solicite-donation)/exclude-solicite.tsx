import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useNotifications } from 'react-native-notificated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { useLoaderHook } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

interface IProps {
  uid: string | string[];
  refetch: () => void;
  data: ISoliciteDonation;
}

export const ExcludeSoliccite = ({ uid, refetch, data }: IProps) => {
  const { user } = useCurrentUserHook();
  const router = useRouter();
  const {
    stopLoadingForReactQueryError,
    mutation: { startLoadingForUseMutation },
    setIsLoading,
  } = useLoaderHook();
  const { notify } = useNotifications();

  const { mutate: mutateExcludeSoliciteDonation, isPending: isPendingExcludeSoliciteDonation } =
    useMutation({
      mutationKey: ['exclude-solicite-donation', uid],
      mutationFn: async () => {
        console.log('começou a excluir');
        if (!uid) throw new Error('UID não encontrado');
        if (!user) throw new Error('Usuário não encontrado');
        const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
        if (user.uid !== data?.ownerUid) throw new Error('Usuário não é o proprietário da reserva');
        const result = await SoliciteDonationsSerivce.ExcludeSoliciteDonation(uidFormatted);
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
        mutateExcludeSoliciteDonation();
      },
      isLoading: isPendingExcludeSoliciteDonation,
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
        isLoading={isPendingExcludeSoliciteDonation}
        onPress={() => open()}>
        Excluir
      </Button>
    </>
  );
};
