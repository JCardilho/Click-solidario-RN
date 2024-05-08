import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useNotifications } from 'react-native-notificated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';
import RNPickerSelect from 'react-native-picker-select';

export default function RegisterSolicitationPage() {
  const { uid } = useLocalSearchParams();
  const { user } = useCurrentUserHook();
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<'total' | 'partial'>();
  const { notify } = useNotifications();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ['register-solicitation'],
    mutationFn: async () => {
      if (!type) {
        notify('error', {
          params: {
            title: 'Tipo de ajuda é obrigatório',
          },
        });
        throw new Error('Tipo de ajuda é obrigatório');
      }

      if (!uid || !user || !user.uid || !user.name) throw new Error('Dados inválidos');

      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      if (!uidFormatted) throw new Error('UID não encontrado');
      await SoliciteDonationsSerivce.RegisterAssistence({
        assistence: {
          message: message,
          uid: user?.uid,
          name: user?.name,
          isVerified: false,
          type: type || 'partial',
        },
        solicite_donation_uid: uidFormatted,
      });
    },
    onSuccess: () => {
      notify('success', {
        params: {
          title: 'Registrado com sucesso!',
        },
      });
      router.back();
    },
    onError: () => {
      notify('error', {
        params: {
          title: 'Erro ao registrar solicitação!',
        },
      });
    },
  });

  const { open, BottomSheet } = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      onPress: () => {
        mutate();
      },
      isLoading: isPending,
    },
    textNeedConfirm: 'Deseja registrar a solicitação?',
    textNeedConfirmButton: 'Registrar',
    descriptionNeedConfirm: 'Obs: seu nome ficará visível todos os usuários!!',
  });

  return (
    <>
      <HeaderBack title="Registrar assistência" />
      <BottomSheet />
      <View className="p-4">
        {!type && <Text className="font-kanit text-red-500 text-md">Obrigatório!!</Text>}
        {type && (
          <Text className="font-kanit text-md">
            Você: {type === 'total' ? 'ajudou totalmente!' : 'ajudou parcialmente!'}
          </Text>
        )}
        <RNPickerSelect
          key={`helped-type`}
          style={{
            viewContainer: {
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: !type ? 'red' : '#000',
            },
            placeholder: {
              textAlign: 'center',
              color: '#000',
            },
            modalViewMiddle: {
              borderRadius: 10,
            },
          }}
          onValueChange={(value) => setType(value as 'total' | 'partial')}
          items={[
            {
              label: 'Ajudei totalmente',
              value: 'total',
              key: 'helped-total',
            },
            { label: 'Ajudei Parcialmente', value: 'partial', key: 'helped-partial' },
          ]}
          placeholder={{
            label: 'Você ajudou totalmente ou parcialmente?',
            value: null,
          }}
        />

        <View className="w-full flex items-center justify-center mt-2">
          <Text className="font-kanit text-red text-md text-center">
            Obs: seu nome ficará visível para todos os usuários!!
          </Text>
        </View>
        <Input
          placeholder="Digite uma mensagem (opcional)"
          onChangeText={(text) => setMessage(text)}
          className="mt-1"
        />
        <Button
          variant="success"
          onPress={open}
          className="mt-4"
          icon={{
            name: 'handshake-o',
            color: 'white',
            size: 15,
          }}>
          Registrar assistência
        </Button>
      </View>
    </>
  );
}
