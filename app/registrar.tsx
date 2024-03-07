import { Link, Stack, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { UserService } from '~/utils/services/UserService';
import { z } from 'zod';
import { Controller, Form, useForm } from 'react-hook-form';
import { zodResolver } from './../node_modules/@hookform/resolvers/zod/src/zod';
import { useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import RNPickerSelect from 'react-native-picker-select';

const criarUserSchema = z
  .object({
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
    cpf: z.string().optional(),
    name: z.string().optional(),
    isReceptor: z.boolean(),
    pix: z.object({
      key: z.string({
        required_error: 'Chave pix é obrigatória',
      }),
      type: z.string({
        required_error: 'Tipo de chave pix é obrigatória',
      }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.isReceptor) {
      if (data.cpf) return;

      if (!data.name)
        ctx.addIssue({
          message: 'Nome é obrigatório',
          path: ['name'],
          code: z.ZodIssueCode.custom,
        });
      if (
        (data.name && data.name.split(' ').length < 2) ||
        (data.name &&
          (data.name.split(' ')[1] || data.name.split(' ')[1] === '') &&
          data.name.split(' ')[1].length < 2)
      )
        ctx.addIssue({
          message: 'Nome completo é obrigatório',
          path: ['name'],
          code: z.ZodIssueCode.custom,
        });

      if (data.cpf?.length !== 11)
        ctx.addIssue({
          message: 'CPF inválido',
          path: ['cpf'],
          code: z.ZodIssueCode.custom,
        });

      const regexForCpf = /[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}/;
      if (data.cpf && !regexForCpf.test(data.cpf))
        ctx.addIssue({
          message: 'CPF inválido',
          path: ['cpf'],
          code: z.ZodIssueCode.custom,
        });

      return;
    }
  });

type CreateUser = z.infer<typeof criarUserSchema>;

export default function Registrar() {
  const router = useRouter();

  const { isPending, isError, mutate } = useMutation({
    mutationKey: ['createUser'],
    mutationFn: async () => {
      const resposta = await UserService.createUser({
        email: getValues('email'),
        password: getValues('senha'),
        cpf: getValues('cpf'),
        name: getValues('name'),
        pix: {
          key: getValues('pix.key'),
          type: getValues('pix.type'),
        },
      });
      return resposta;
    },
    onError: (err) => {
      console.log('Erro ao criar usuário');
      console.log('err', err);
    },
    onSuccess: () => {
      console.log('Usuário criado com sucesso');
      setValue('email', '');
      setValue('senha', '');
      setValue('cpf', '');
      setValue('name', '');
      setValue('pix.key', '');
      setValue('pix.type', '');
      router.push('/');
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<CreateUser>({
    resolver: zodResolver(criarUserSchema),
  });

  return (
    <View className={styles.container}>
      <Stack.Screen
        options={{
          title: 'Registrar',
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

          <BouncyCheckbox
            className="text-lg"
            text="Recetor"
            fillColor="blue"
            unfillColor="#FFFFFF"
            iconStyle={{ borderColor: 'blue' }}
            onPress={(isChecked: boolean) => setValue('isReceptor', isChecked)}
          />

          {watch('isReceptor') && (
            <>
              <View>
                <Text className="text-lg">Digite seu nome:</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Nome"
                      className="text-lg border-2 border-blue-500 p-2 rounded-lg placeholder:text-2xl placeholder:text-black"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.name && <Text>{errors.name?.message}</Text>}
              </View>
              <View>
                <Text className="text-lg">Digite seu CPF:</Text>
                <Controller
                  control={control}
                  name="cpf"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="CPF"
                      className="text-lg border-2 border-blue-500 p-2 rounded-lg placeholder:text-2xl placeholder:text-black"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.cpf && <Text>{errors.cpf?.message}</Text>}
              </View>
              <View>
                <Text className="text-lg">Digite sua chave pix:</Text>

                <Controller
                  control={control}
                  name="pix"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Pix"
                      className="text-lg border-2 border-blue-500 p-2 rounded-lg placeholder:text-2xl placeholder:text-black"
                      onChangeText={(text) => {
                        onChange(text);
                        setValue('pix.key', text);
                      }}
                    />
                  )}
                />
                {errors.pix && <Text>{errors.pix?.message}</Text>}
                <Text className="text-md text-red-500 font-medium">
                  Utilize a chave pix caso queira receber doações em espécie
                </Text>
              </View>
              <View>
                <Controller
                  control={control}
                  name="pix"
                  render={({ field: { value } }) => (
                    <RNPickerSelect
                      key={`select-type-pix`}
                      onValueChange={(value) => setValue('pix.type', value)}
                      items={[
                        { label: 'Telefone', value: 'telephone', key: 'select-type-pix-telephone' },
                        { label: 'CPF', value: 'cpf', key: 'select-type-pix-cpf' },
                        {
                          label: 'Chave Aleatoria',
                          value: 'aleatory-key',
                          key: 'select-type-pix-aleatory-key',
                        },
                        { label: 'Email', value: 'email', key: 'select-type-pix-email' },
                      ]}
                      placeholder={{
                        label: 'Selecione o tipo de chave pix',
                        value: null,
                      }}
                    />
                  )}
                />
              </View>
            </>
          )}

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
