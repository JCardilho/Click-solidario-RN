import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { UserService } from '~/utils/services/UserService';
import { useNotifications } from 'react-native-notificated';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import SendedEmailImage from '~/assets/background/SendedEmail.png';

export default function RecoverPassword() {
  const [email, setEmail] = useState<string>('');
  const [isSend, setIsSend] = useState<boolean>(false);
  const { notify } = useNotifications();
  const router = useRouter();

  const { mutate: handleSendEmail, isPending: isPendingSendEmail } = useMutation({
    mutationKey: ['recover-password', email],
    mutationFn: async () => {
      await UserService.RecoverPassword(email);
      setIsSend(true);
      return true;
    },
    onSuccess: () => {
      notify('success', {
        params: {
          title: 'Email enviado com sucesso',
          description: 'Verifique sua caixa de entrada',
        },
      });
    },
    onError: (err: any) => {
      console.log('err', err);
      notify('error', {
        params: {
          title: 'Erro ao enviar email',
          description: 'Verifique se o email está correto',
        },
      });
    },
  });

  return (
    <View className="p-4">
      <HeaderBack></HeaderBack>
      <View className="w-full flex flex-col gap-2 h-[85vh] items-center justify-center">
        {!isSend && (
          <View className="w-full flex flex-col gap-2">
            <Input
              label="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
            />
            <Button
              onPress={() => handleSendEmail()}
              isLoading={isPendingSendEmail}
              disabled={isPendingSendEmail}
              icon={{
                name: 'send',
                color: 'white',
                size: 20,
              }}>
              Enviar
            </Button>
          </View>
        )}

        {isSend && (
          <View className="w-full flex flex-col gap-2 items-center justify-center">
            <Image source={SendedEmailImage} style={{ width: 250, height: 250 }} />
            <Text>Email de recuperação enviado para {email}</Text>
            <Button
              variant="primary"
              href={() => {
                router.push('/entrar');
              }}>
              Voltar
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
