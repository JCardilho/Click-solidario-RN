import { Link, Stack, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserService } from '~/utils/services/UserService';
import { z } from 'zod';
import { Controller, Form, useForm } from 'react-hook-form';
import { zodResolver } from './../node_modules/@hookform/resolvers/zod/src/zod';
import { useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import RNPickerSelect from 'react-native-picker-select';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { Button } from '~/components/Button';
import { LocationService } from '~/utils/services/LocationService';
import { useNotifications } from 'react-native-notificated';
import { Loader } from '~/components/Loader';

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
    name: z
      .string({
        required_error: 'Nome é obrigatório',
      })
      .refine(
        (data) => {
          if (!data) return false;
          if (data.split(' ').length < 2) return false;
          if ((data.split(' ')[1] || data.split(' ')[1] === '') && data.split(' ')[1].length < 2)
            return false;
          return true;
        },
        {
          message: 'Nome completo é obrigatório',
        }
      ),
    isReceptor: z.boolean(),
    pix: z
      .object({
        key: z.string().optional(),
        type_pix: z.string().optional(),
      })
      .optional(),
    city: z.string({
      required_error: 'Cidade é obrigatória',
    }),
    state: z.string({
      required_error: 'Estado é obrigatório',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.isReceptor) {
      if (!data.cpf)
        ctx.addIssue({
          message: 'CPF é obrigatório',
          path: ['cpf'],
          code: z.ZodIssueCode.custom,
        });

      /* if (!data.name)
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
        }); */

      if (data.pix && data.pix.key && (!data.pix.type_pix || data.pix.type_pix.length < 3))
        ctx.addIssue({
          message: 'Tipo de chave pix é obrigatório',
          path: ['pix.type_pix'],
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
  const { notify } = useNotifications();

  const { isPending, isError, mutate } = useMutation({
    mutationKey: ['createUser'],
    mutationFn: async () => {
      const resposta = await UserService.createUser({
        email: getValues('email'),
        password: getValues('senha'),
        cpf: getValues('cpf'),
        name: getValues('name'),
        pix: {
          key: getValues('pix.key') || '',
          type: getValues('pix.type_pix') || '',
        },
        city: getValues('city'),
        state: getValues('state'),
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
      setValue('pix.type_pix', '');
      setValue('isReceptor', false);
      setValue('city', '');
      setValue('state', '');
      router.replace('/entrar');
    },
  });

  const { data: AllStates, isRefetching: isPendingGetAllStates } = useQuery({
    queryKey: ['get-all-states'],
    queryFn: async () => {
      try {
        const result = await LocationService.GetAllStatesFromBrazil();
        return result;
      } catch (err) {
        console.log('Erro ao buscar estados', err);
        notify('error', {
          params: {
            title: 'Erro ao buscar estados',
          },
        });
        return [];
      }
    },
  });

  const {
    data: Municipality,
    isPending: isPendingMunicipality,
    mutate: GetMunicipalityMutate,
  } = useMutation({
    mutationKey: ['get-municipality'],
    mutationFn: async (uf: string) => {
      try {
        const result = await LocationService.GetAllMunicipalityFromBrazil(uf);
        return result;
      } catch (err) {
        console.log('Erro ao buscar a cidade', err);
        notify('error', {
          params: {
            title: 'Erro ao buscar a cidade',
          },
        });
        return [];
      }
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

    reValidateMode: 'onChange',
  });

  return (
    <>
      <HeaderBack title="Criar conta" />
      <Loader
        hiddenLoaderActive
        fullscreen
        isLoader={isPendingGetAllStates || isPendingMunicipality}
      />
      <ScrollView className={styles.container}>
        <View className={styles.main}>
          <View className="w-auto flex flex-col gap-4">
            <View>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Nome"
                    label="Digite seu nome:"
                    onChangeText={onChange}
                    value={value}
                    error={errors.name?.message}
                  />
                )}
              />
            </View>
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
                name="senha"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Senha"
                    label="Digite sua senha:"
                    onChangeText={onChange}
                    value={value}
                    error={errors.senha?.message}
                  />
                )}
              />
            </View>

            <View>
              {AllStates && !isPendingGetAllStates && (
                <>
                  <Text className="text-md font-kanit">Digite seu estado: </Text>
                  <Controller
                    control={control}
                    name="state"
                    render={({ field: { onChange, value } }) => (
                      <RNPickerSelect
                        key={`select-state`}
                        style={{
                          viewContainer: {
                            backgroundColor: '#f2f2f2',
                            borderRadius: 7,
                            borderWidth: 1,
                            borderColor: errors.state ? 'red' : '#023E8A',
                          },
                          placeholder: {
                            textAlign: 'center',
                            color: '#000',
                            fontFamily: 'Kanit_400Regular',
                          },
                          done: {
                            fontFamily: 'Kanit_400Regular',
                          },
                        }}
                        onValueChange={(value) => {
                          setValue('state', value);
                          if (getValues('city')) setValue('city', '');
                          GetMunicipalityMutate(value);
                        }}
                        items={
                          AllStates?.map((state) => ({
                            label: state.nome,
                            value: state.sigla,
                            key: `select-state-${state.sigla}`,
                          })) || []
                        }
                        placeholder={{
                          label: 'Estado',
                          value: null,
                        }}
                      />
                    )}
                  />
                </>
              )}
              {errors.state && (
                <Text className="text-md text-red-500">* {errors.state?.message}</Text>
              )}
            </View>
            <View>
              {Municipality && !isPendingMunicipality && (
                <>
                  <Text className="text-md font-kanit">Digite sua cidade: </Text>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, value } }) => (
                      <RNPickerSelect
                        key={`select-municipality`}
                        style={{
                          viewContainer: {
                            backgroundColor: '#f2f2f2',
                            borderRadius: 7,
                            borderWidth: 1,
                            borderColor: errors.city ? 'red' : '#023E8A',
                          },
                          placeholder: {
                            textAlign: 'center',
                            color: '#000',
                            fontFamily: 'Kanit_400Regular',
                          },
                          done: {
                            fontFamily: 'Kanit_400Regular',
                          },
                        }}
                        onValueChange={(value) => {
                          setValue('city', value);
                        }}
                        items={
                          Municipality?.map((city) => ({
                            label: city.nome,
                            value: city.nome,
                            key: `select-municipality-${city.nome}`,
                          })) || []
                        }
                        placeholder={{
                          label: 'Cidade',
                          value: null,
                        }}
                      />
                    )}
                  />
                </>
              )}
              {errors.city && (
                <Text className="text-md text-red-500">* {errors.city?.message}</Text>
              )}
            </View>

            <BouncyCheckbox
              className="text-lg p-5 rounded-lg border border-primary font-kanit"
              text="Selecione se você deseja receber doações!!"
              unfillColor="#ffffff"
              fillColor="#023E8A"
              iconStyle={{ borderColor: 'blue' }}
              innerIconStyle={{ borderColor: 'blue' }}
              onPress={(isChecked: boolean) => setValue('isReceptor', isChecked)}
              textStyle={{ fontFamily: 'Kanit_400Regular' }}
            />

            {watch('isReceptor') && (
              <>
                <View>
                  <Controller
                    control={control}
                    name="cpf"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder="CPF"
                        label="Digite seu CPF:"
                        onChangeText={onChange}
                        value={value}
                        error={errors.cpf?.message}
                      />
                    )}
                  />
                </View>
                <View>
                  <Controller
                    control={control}
                    name="pix"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        placeholder="Pix"
                        label="Digite sua chave pix: ( * opcional )"
                        error={errors.pix?.key?.message}
                        onChangeText={(text) => {
                          onChange(text);
                          setValue('pix.key', text);
                        }}
                        message="Utilize a chave pix caso queira receber doações em espécie"
                      />
                    )}
                  />
                </View>
                <View>
                  {watch('pix') && watch('pix.key') && (
                    <>
                      <Controller
                        control={control}
                        name="pix"
                        render={({ field: { value } }) => (
                          <RNPickerSelect
                            key={`select-type-pix`}
                            style={{
                              viewContainer: {
                                backgroundColor: '#eaeaea',
                                borderRadius: 7,
                                borderWidth: 1,
                                borderColor: errors.state ? 'red' : '#023E8A',
                              },
                              placeholder: {
                                textAlign: 'center',
                                color: '#000',
                                fontFamily: 'Kanit_400Regular',
                              },
                              done: {
                                fontFamily: 'Kanit_400Regular',
                              },
                            }}
                            onValueChange={(value) => setValue('pix.type_pix', value)}
                            items={[
                              {
                                label: 'Telefone',
                                value: 'telephone',
                                key: 'select-type-pix-telephone',
                              },
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
                      {errors.pix?.type_pix && (
                        <Text className="text-md text-red-500">
                          * {errors.pix?.type_pix?.message}
                        </Text>
                      )}
                    </>
                  )}
                </View>
              </>
            )}

            <Button
              className="w-full bg-blue-500 p-2  rounded-lg "
              onPress={handleSubmit(() => mutate())}
              icon={{
                name: 'arrow-right',
                size: 20,
                color: '#fff',
              }}
              isLoading={isPending}>
              Registrar
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
