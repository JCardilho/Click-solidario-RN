import { Link, Stack, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { UserService } from '~/utils/services/UserService';
import { z } from 'zod';
import { Controller, Form, useForm } from 'react-hook-form';
import { zodResolver } from './../node_modules/@hookform/resolvers/zod/src/zod';

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

export default function Registrar() {
  const router = useRouter();
  const { isPending, isError, mutate } = useMutation({
    mutationKey: ['createUser'],
    mutationFn: async () => {
      const resposta = await UserService.createUser(getValues('email'), getValues('senha'));
      return resposta;
    },
    onError: (err) => {
      console.log('Erro ao criar usuário');
      console.log('err', err);
    },
    onSuccess: () => {
      console.log('Usuário criado com sucesso');
      router.push('/');
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

  return (
    <View className={styles.container}>
      <Stack.Screen
        options={{
          title: 'Regitrar',

          headerShown: true,
        }}
      />
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
              <Text className="text-center text-white text-2xl">Registrar</Text>
            </TouchableOpacity>
          )}

          <Link href={'/'} className="w-full  p-2  rounded-lg ">
            <Text className="text-center  text-2xl">Voltar</Text>
          </Link>
        </View>
      </View>
    </View>
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
