import { Stack, Link, useRouter } from 'expo-router';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { UserService } from '~/utils/services/UserService';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import BackgroundImage from '~/assets/background/banner.jpg';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import PagerView from 'react-native-pager-view';
import { Divider } from '~/components/Divider';
import PersonDonationStoryset from '~/assets/background/PersonDonationStoryset.png';
import QuestionStoryset from '~/assets/background/QuestionsStoryset.png';
import Logo from '~/assets/icon/logo.png';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { useNotifications } from 'react-native-notificated';
import { FontAwesome } from '@expo/vector-icons';

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
  const { setCache, getCache, DeleteCache } = useCacheHook();
  const [firstOpen, setFirstOpen] = useState<boolean>();
  const ref = useRef<PagerView>(null);

  useEffect(() => {
    const verifyFirstOpen = async () => {
      try {
        const firstOpen = await getCache('firstOpen');
        if (!firstOpen || firstOpen === 'true') {
          await setCache('firstOpen', 'false');
          setFirstOpen(true);
          return;
        }
        setFirstOpen(firstOpen === 'true' ? true : false);
      } catch (err) {
        console.log('eroskaof', err);
        setFirstOpen(true);
        await setCache('firstOpen', 'true');
      }
    };

    verifyFirstOpen();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {firstOpen === true && (
        <PagerView style={stylesS.viewPager} initialPage={0} ref={ref}>
          <View className="justify-center items-center px-4 bg-white" key="1">
            <Image
              source={PersonDonationStoryset}
              className="object-cover w-[250px] h-[250px]"
              alt="background-image"
            />
            <View className="flex flex-col gap-2 items-center justify-center">
              <Text className="font-montserrat font-bold text-4xl text-center">Bem vindo ao</Text>
              <Text className="text-blue-500 underline text-center font-montserrat font-bold text-4xl">
                Click Solidário
              </Text>
            </View>
            <Divider color="bg-transparent" />
            <Text className="text-center font-kanit  text-2xl">
              Estamos felizes em ter você por aqui! <Text className="text-blue-500">Ajudar</Text>{' '}
              nunca foi tão <Text className="text-blue-500">fácil</Text>. Faça parte dessa{' '}
              <Text className="text-blue-500"> corrente do bem!</Text>
            </Text>
            <Divider color="bg-transparent" />
            <View className="w-full">
              <View className="items-center justify-center">
                <TouchableOpacity
                  onPress={() => {
                    ref.current?.setPage(1);
                  }}
                  className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center">
                  <FontAwesome name="arrow-right" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <View className="items-center justify-center"></View>
              <View className="w-full flex flex-row gap-2 items-center justify-center mt-12">
                <View className="w-2 h-2 rounded-full bg-blue-500"></View>
                <View className="w-2 h-2 rounded-full bg-zinc-500"></View>
                <View className="w-2 h-2 rounded-full bg-zinc-500"></View>
              </View>
            </View>
            <Button
              variant="ghost"
              onPress={() => {
                ref.current?.setPage(2);
              }}
              icon={{
                name: 'sign-out',
                color: 'black',
                size: 15,
              }}
              className="absolute bottom-4 right-4">
              Pular
            </Button>
          </View>
          <View className="p-4 items-center justify-center bg-white" key="2">
            <Image
              source={QuestionStoryset}
              className="object-cover w-[250px] h-[250px]"
              alt="background-image"
            />
            <Text className="font-montserrat font-bold text-4xl">Instruções</Text>
            <Divider />
            <Text className="text-center font-kanit  text-2xl">
              Temos duas páginas principais, a primeira é a{' '}
              <Text className="text-blue-500">"Solicitar ou Doar"</Text> e
              <Text className="text-blue-500">"Reservar ou Disponibilizar"</Text>, veja abaixo como
              funciona:
            </Text>
            <Divider />
            <View className="my-4 flex-col gap-4">
              <Text className="font-kanit text-red-500 text-center">
                Obs: A página inicial contém o conteúdo das duas páginas
              </Text>
              <Text className="text-justify font-kanit text-xl">
                <Text className="text-blue-500">* Solicitar ou Doar:</Text> Nessa página você pode
                doar itens para as pessoas que solicitaram, ou solicitar itens que você precisa.
              </Text>
              <Text className="text-justify font-kanit text-xl">
                <Text className="text-blue-500">* Reservar ou Disponibilizar:</Text> Nessa página
                você pode disponibilizar itens para que as pessoas possam reservar, ou reservar
                itens que estão disponíveis.
              </Text>
            </View>

            <View className="w-full">
              <View className="items-center justify-center">
                <TouchableOpacity
                  onPress={() => {
                    ref.current?.setPage(2);
                  }}
                  className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center">
                  <FontAwesome name="arrow-right" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <View className="items-center justify-center"></View>
              <View className="w-full flex flex-row gap-2 items-center justify-center mt-12">
                <View className="w-2 h-2 rounded-full bg-zinc-500"></View>
                <View className="w-2 h-2 rounded-full bg-blue-500"></View>
                <View className="w-2 h-2 rounded-full bg-zinc-500"></View>
              </View>
            </View>
          </View>
          <View key="3">
            <LoginComponent />
          </View>
        </PagerView>
      )}

      {firstOpen === false && <LoginComponent />}
    </>
  );
}

const LoginComponent = () => {
  const router = useRouter();
  const { setUser } = useCurrentUserHook();
  const { notify } = useNotifications();
  const [isPassowrd, setIsPassword] = useState<boolean>(true);

  const WD = useWindowDimensions();

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
      notify('error', {
        params: {
          title: err.message,
        },
        /*   config: {
          notificationPosition: 'bottom-left',
        }, */
      });
    },
    onSuccess: (data) => {
      console.log('Usuário criado com sucesso');
      console.log('data', data.email);
      setUser(data);
      console.log('setou o usuario');
      router.replace('/home');
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

  const Atalho = useBottomSheetHook({
    children: (
      <View className="p-4">
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
      </View>
    ),
  });

  return (
    <>
      <Atalho.BottomSheet />
      <ScrollView className={styles.container}>
        <View className={styles.main}>
          {/* <View className="absolute  left-[-150px] bottom-[-50px] opacity-50 rounded-full  overflow-hidden">
            <Image
              source={BackgroundImage}
              className="object-cover w-[500px] h-[500px]"
              alt="background-image"
            />
          </View> */}

          <View className="w-full flex flex-col gap-4 rounded-lg p-4">
            <View className="w-auto full flex-col gap-4  items-center justify-center">
              {/*   <Image source={Logo} className="w-20 h-20 " alt="background-image" /> */}
              <Text className="text-center text-6xl font-bold">Entrar</Text>
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
                    error={errors.email?.message}
                  />
                )}
              />
            </View>
            <View className="w-full flex flex-row gap-2 items-end ">
              <Controller
                control={control}
                name="senha"
                render={({ field: { onChange, value } }) => (
                  <>
                    <Input
                      placeholder="Senha"
                      style={{
                        width: WD.width - 100,
                      }}
                      onChangeText={onChange}
                      label="Digite sua senha"
                      value={value}
                      error={errors.senha?.message}
                      isPassword={isPassowrd}
                    />
                  </>
                )}
              />
              <Button
                onPress={() => setIsPassword(!isPassowrd)}
                className="h-auto"
                variant="ghost"
                icon={{
                  name: isPassowrd ? 'eye-slash' : 'eye',
                  color: 'black',
                  size: 25,
                }}></Button>
            </View>

            <Button
              variant="default"
              onPress={handleSubmit(() => mutate())}
              isLoading={isPending}
              className="items-center justify-center"
              icon={{
                name: 'sign-in',
                color: 'white',
                size: 15,
              }}>
              Entrar
            </Button>

            <Divider />

            <View className="w-full flex items-center justify-center ">
              <Text className="font-kanit text-sm">Não tem uma conta?</Text>
              <Link
                href={'/registrar'}
                className="p-2  rounded-lg text-blue-500 underline font-bold">
                <Text className="text-center  text-2xl">Registre-se</Text>
              </Link>
            </View>

            <View className="w-full flex items-center justify-center">
              <Text className="font-kanit text-sm">Esqueceu sua senha?</Text>

              <TouchableOpacity className="  p-2  rounded-lg ">
                <Link
                  href={'/recover-password'}
                  className="text-center text-blue-500 underline font-bold text-2xl">
                  Recuperar-senha
                </Link>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = {
  button: 'items-center bg-indigo-500 rounded-[28px] shadow-md p-4',
  buttonText: 'text-white text-lg font-semibold text-center',
  container: 'flex-1 bg-white overflow-visible',
  main: 'w-screen h-screen items-center justify-center relative overflow-visible',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};

const stylesS = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
