import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from 'react-native-notificated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

interface IProps {
  data: ISoliciteDonation;
  queryId: string[];
}

export const VerifiedSoliciteDonation = (props: IProps) => {
  const { user } = useCurrentUserHook();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  const { mutate, isPending } = useMutation({
    mutationKey: ['verified-solicite-donation'],
    mutationFn: async () => {
      if (!user || !user.uid || !props.data || !props.data.uid) return 'ERR';

      await SoliciteDonationsSerivce.VerifiedSocilitationOfSocialAssistence({
        isVerified: !props.data.isVerified,
        uid: props.data.uid,
      });

      return 'OK';
    },
    onSuccess: async () => {
      try {
        await queryClient.setQueryData(props.queryId, (old: ISoliciteDonation) => {
          return {
            ...old,
            isVerified: !old.isVerified,
          };
        });
        notify('success', {
          params: {
            title: 'Sucesso!!',
            description: 'Solicitação verificada com sucesso',
          },
        });
      } catch (err) {
        console.log('err', err);
      }
    },
  });

  const VerifyBottomSheet = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => mutate(),
      isLoading: isPending,
    },
    textNeedConfirm: 'Você tem certeza que deseja verificar essa solicitação?',
    textNeedConfirmButton: 'Verificar',
  });

  const UnVerifyBottomSheet = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => mutate(),
      isLoading: isPending,
    },
    textNeedConfirm: 'Você tem certeza que deseja retirar a verificação dessa solicitação?',
    textNeedConfirmButton: 'Retirar verificação',
  });

  return (
    <>
      <VerifyBottomSheet.BottomSheet />
      <UnVerifyBottomSheet.BottomSheet />
      {props.data.isVerified ? (
        <Button
          onPress={() => UnVerifyBottomSheet.open()}
          variant="destructive"
          isLoading={isPending}
          icon={{
            name: 'check',
            color: 'white',
            size: 15,
          }}>
          Retirar verificação
        </Button>
      ) : (
        <Button
          onPress={() => VerifyBottomSheet.open()}
          isLoading={isPending}
          icon={{
            name: 'check',
            color: 'white',
            size: 15,
          }}>
          Verificar
        </Button>
      )}
    </>
  );
};
