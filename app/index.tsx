import { Stack, Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { z } from 'zod';
import { UserService } from '~/utils/services/UserService';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useCacheHook } from '~/utils/hooks/cacheHook';

const criarUserSchema = z.object({
  email: z
    .string({
      required_error: 'Email é obrigatório',
    })
    .email({
      message: 'Email inválido',
    }),
  senha: z
    .string({
      required_error: 'Senha é obrigatória',
    })
    .min(6, {
      message: 'Senha deve ter no mínimo 6 caracteres',
    }),
});

type CreateUser = z.infer<typeof criarUserSchema>;

export default function Page() {
  const router = useRouter();
  const { verifyUserAndSendUserFromHome, user, setUser } = useCurrentUserHook();
  const { setCache } = useCacheHook();

  const { isPending, isError, mutate } = useMutation({
    mutationKey: ['loginUser'],
    mutationFn: async () => {
      const resposta = await UserService.loginUser(getValues('email'), getValues('senha'));
      return resposta;
    },
    onError: (err) => {
      console.log('Erro ao criar usuário');
      console.log('err', err);
    },
    onSuccess: (data) => {
      console.log('Usuário criado com sucesso');
      console.log('data', data.user.email);
      setUser(data);
      console.log('setou o usuario');
      router.push('/home');
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<CreateUser>({
    resolver: zodResolver(criarUserSchema),
  });

  useEffect(() => {
    if (!user) {
      const verify = async () => {
        await verifyUserAndSendUserFromHome();
      };
      verify();

      /* const verify = async () => {
        setCache('user', null);
      };
      verify(); */
    }
  }, [user]);

  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Overview' }} />
      <View className={styles.main}>
        <View className="w-auto flex flex-col gap-4">
          <View>
            <Text className="text-lg">Digite seu email:</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Email"
                  className="text-lg border-2 border-blue-500 p-2 rounded-lg placeholder:text-2xl placeholder:text-black"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && <Text>{errors.email?.message}</Text>}
          </View>
          <View>
            <Text className="text-lg">Digite seu senha:</Text>
            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Senha"
                  className="text-lg border-2 border-blue-500 p-2 rounded-lg placeholder:text-2xl placeholder:text-black"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.senha && <Text>{errors.senha?.message}</Text>}
          </View>

          {isError && <Text>Erro ao cadastrar</Text>}
          {isPending ? (
            <Text>Carregando...</Text>
          ) : (
            <TouchableOpacity
              className="w-full bg-blue-500 p-2  rounded-lg "
              onPress={handleSubmit(() => mutate())}>
              <Text className="text-center text-white text-2xl">Entrar</Text>
            </TouchableOpacity>
          )}

          <Link href={'/registrar'} className="w-full  p-2  rounded-lg ">
            <Text className="text-center  text-2xl">Registrar</Text>
          </Link>
          <Link href={'/menu'} className="w-full  p-2  rounded-lg ">
            <Text className="text-center  text-2xl">Details</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = {
  button: 'items-center bg-indigo-500 rounded-[28px] shadow-md p-4',
  buttonText: 'text-white text-lg font-semibold text-center',
  container: 'flex-1 p-6',
  main: 'flex-1 max-w-[960] justify-between',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};
