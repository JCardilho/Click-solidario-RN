import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { useNotifications } from 'react-native-notificated';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { UserService } from '~/utils/services/UserService';

const createSocialAssistantSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email({
      message: 'Email inválido',
    }),
  password: z
    .string({
      required_error: 'Senha é obrigatória',
    })
    .min(6, {
      message: 'Senha deve ter no mínimo 6 caracteres',
    }),
});

type CreateSocialAssistant = z.infer<typeof createSocialAssistantSchema>;

export default function CreateSocialaAssistant() {
  const router = useRouter();
  const { notify } = useNotifications();

  const { isPending, mutate } = useMutation({
    mutationKey: ['create-social-assistant'],
    mutationFn: async () => {
      const resposta = await UserService.CreateSocialAssistant({
        email: getValues('email'),
        password: getValues('password'),
      });
      return resposta;
    },
    onError: (err: any) => {
      console.log('Erro ao criar usuário');
      console.log('err', err);
      notify('error', {
        params: {
          title: 'Erro ao criar usuário',
          description: 'Erro ao criar usuário, tente novamente mais tarde',
        },
      });
    },
    onSuccess: () => {
      console.log('Usuário criado com sucesso');
      setValue('email', '');
      setValue('password', '');
      router.back();
    },
  });

  const {
    control,
    formState: { errors },
    getValues,
    setValue,
    handleSubmit,
  } = useForm<CreateSocialAssistant>({
    resolver: zodResolver(createSocialAssistantSchema),

    reValidateMode: 'onChange',
  });

  return (
    <>
      <HeaderBack title="Criar assistente social" />
      <ScrollView className={styles.container}>
        <View className={styles.main}>
          <View className="w-auto flex flex-col gap-4">
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Email"
                    label="Digite seu email:"
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                  />
                )}
              />
            </View>
            <View>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Senha"
                    label="Digite sua senha:"
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>
            <Button
              className="w-full bg-blue-500 p-2  rounded-lg "
              onPress={handleSubmit(() => mutate())}
              icon={{
                name: 'arrow-right',
                size: 20,
                color: '#fff',
              }}
              isLoading={isPending}>
              Registrar assistente social
            </Button>
          </View>
        </View>

        <View className="h-[250px] w-full"></View>
      </ScrollView>
    </>
  );
}

const styles = {
  backButton: 'flex-row',
  backButtonText: 'text-blue-500 ml-1',
  container: 'flex-1 p-6',
  main: 'flex-1 max-w-[960]',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};
