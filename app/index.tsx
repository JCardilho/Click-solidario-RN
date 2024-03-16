import { Stack, Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { z } from 'zod';
import { UserService } from '~/utils/services/UserService';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import BackgroundImage from '~/assets/background/banner.jpg';
import BackgroundLogo from '~/assets/icon/logo.png';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';

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

export default function LoginPage() {
  const router = useRouter();
  const { verifyUserAndSendUserFromHome, user, setUser } = useCurrentUserHook();
  const { setCache, getCache, DeleteCache } = useCacheHook();

  const { isPending, isError, mutate } = useMutation({
    mutationKey: ['loginUser'],
    mutationFn: async () => {
      console.log('email', getValues('email'));
      console.log('senha', getValues('senha'));
      const resposta = await UserService.loginUser(getValues('email'), getValues('senha'));
      return resposta;
    },
    onError: (err) => {
      console.log('Erro ao criar usuário');
      console.log('err', err);
    },
    onSuccess: (data) => {
      console.log('Usuário criado com sucesso');
      console.log('data', data.email);
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

  const { refetch: verifyUser } = useQuery({
    queryKey: ['verify-user-funcction'],
    queryFn: async () => {
      /*    const teste = async () => {
          try {
            await DeleteCache('user');
            if (await getCache('user')) return;
            await DeleteCache('user');
          } catch (err) {
            await DeleteCache('user');
          }
        };
        teste();  */
      const verify = async () => {
        await verifyUserAndSendUserFromHome();
      };
      verify();
      return 'OK';
    },
    enabled: false,
  });

  useEffect(() => {
    if (!user) {
      const verify = async () => {
        await verifyUserAndSendUserFromHome();
      };
      verify();
    }
  }, [user]);

  useRefreshOnFocus(verifyUser);

  return (
    <View className={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className={styles.main}>
        <View className="absolute  left-[-150px] bottom-[-50px] opacity-50 rounded-full  overflow-hidden">
          <Image
            source={BackgroundImage}
            className="object-cover w-[500px] h-[500px]"
            alt="background-image"
          />
        </View>

        <View className="w-auto flex flex-col gap-4 border border-zinc-400 rounded-lg p-4 shadow-xl shadow-zinc-600 bg-white">
          <View className="w-auto flex flex-row gap-4  m-4 items-center justify-center">
            <Text className="text-center text-6xl font-bold uppercase">ENTRAR</Text>
          </View>
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Email"
                  onChangeText={onChange}
                  label="Digite seu email"
                  value={value}
                />
              )}
            />
            {errors.email && <Text>{errors.email?.message}</Text>}
          </View>
          <View>
            <Controller
              control={control}
              name="senha"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="senha"
                  onChangeText={onChange}
                  label="Digite sua senha"
                  value={value}
                />
              )}
            />
            {errors.senha && <Text>{errors.senha?.message}</Text>}
          </View>
          {isError && <Text>Erro ao cadastrar</Text>}

          <Button
            variant="default"
            onPress={handleSubmit(() => mutate())}
            isLoading={isPending}
            icon={{
              name: 'sign-in',
              color: 'white',
              size: 15,
            }}>
            Entrar
          </Button>
          <Button
            variant="default"
            onPress={() => {
              setValue('email', 'Gustavo@gmail.com');
              setValue('senha', 'Gustavo1');
            }}
            isLoading={isPending}>
            <Text> Entrar com usuario</Text>
          </Button>

          <Button
            variant="default"
            onPress={() => {
              setValue('email', 'admin@admin.com');
              setValue('senha', 'admin123');
            }}
            isLoading={isPending}>
            <Text>Entrar com administrador</Text>
          </Button>

          <View className="w-full h-[0.10px] bg-zinc-900 my-4"></View>
          <View className="w-full flex items-center justify-center gap-2">
            <Text>Não tem uma conta?</Text>
            <Link
              href={'/registrar'}
              className="  p-2  rounded-lg text-blue-300 underline font-bold">
              <Text className="text-center  text-2xl">Registre-se</Text>
            </Link>
          </View>

          <View className="w-full flex items-center justify-center" gap-2>
            <Text>Esqueceu sua senha?</Text>
            <Link
              href={'/registrar'}
              className="  p-2  rounded-lg text-blue-300 underline font-bold">
              <Text className="text-center  text-2xl">Recuperar-senha</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = {
  button: 'items-center bg-indigo-500 rounded-[28px] shadow-md p-4',
  buttonText: 'text-white text-lg font-semibold text-center',
  container: 'flex-1 p-6 ',
  main: 'flex-1 max-w-[960] justify-center relative',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};
