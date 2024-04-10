import { Link, Stack, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserService } from '~/utils/services/UserService';
import { z } from 'zod';
import { Controller, Form, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import RNPickerSelect from 'react-native-picker-select';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { Button } from '~/components/Button';
import { LocationService } from '~/utils/services/LocationService';
import { useNotifications } from 'react-native-notificated';
import { Loader } from '~/components/Loader';
import { Select } from '~/components/Select';
import { Checkbox } from '~/components/Checkbox';
import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';

const criarUserSchema = z
  .object({
    email: z
      .string({
        required_error: 'Email é obrigatório',
      })
      .email({
        message: 'Email inválido',
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

export default function EditUser() {
  const router = useRouter();
  const { notify } = useNotifications();
  const { user, setUser } = useCurrentUserHook();

  const { isPending, isError, mutate } = useMutation({
    mutationKey: ['update-user', user?.uid || ''],
    mutationFn: async () => {
      if (!user || !user.uid) return;

      if (
        user.city === getValues('city') &&
        user.state === getValues('state') &&
        user.email === getValues('email') &&
        user.name === getValues('name') &&
        user.cpf === getValues('cpf') &&
        user.pix?.key === getValues('pix.key') &&
        user.pix?.type === getValues('pix.type_pix')
      ) {
        notify('warning', {
          params: {
            title: 'Nenhuma alteração foi encontrada!!',
          },
        });

        return;
      }

      const newFields = {
        email: getValues('email'),
        cpf: getValues('isReceptor') ? getValues('cpf') : '',
        name: getValues('name'),
        pix: {
          key: getValues('pix.key') || '',
          type: getValues('pix.type_pix') || '',
        },
        city: getValues('city'),
        state: getValues('state'),
      };

      const resposta = await UserService.UpdateUser(user.uid, newFields);

      setUser({
        ...user,
        ...newFields,
      });

      notify('success', {
        params: {
          title: 'Perfil atualizado com sucesso',
        },
      });

      router.back();

      return resposta;
    },
    onError: (err) => {
      console.log('Erro ao criar usuário');
      console.log('err', err);
    },
  });

  const { data: AllStates, isRefetching: isPendingGetAllStates } = useQuery({
    queryKey: ['get-all-states'],
    queryFn: async () => {
      try {
        const result = await LocationService.GetAllStatesFromBrazil();

        if (user?.city) {
          GetMunicipalityMutate(user.state);
        }

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
        setValue('city', user?.city || '');
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
    defaultValues: {
      email: user?.email || '',
      cpf: user?.cpf || '',
      name: user?.name || '',
      pix: {
        key: user?.pix?.key || '',
        type_pix: user?.pix?.type || '',
      },
      city: user?.city || '',
      state: user?.state || '',
      isReceptor: user?.cpf ? true : false,
    },
  });

  useEffect(() => {
    if (user) {
      setValue('isReceptor', user.cpf ? true : false);
      setValue('cpf', user.cpf || '');
      setValue('pix', {
        key: user.pix?.key || '',
        type_pix: user.pix?.type || '',
      });
      setValue('city', user.city || '');
      setValue('state', user.state || '');
      setValue('email', user.email || '');
      setValue('name', user.name || '');
    }
  }, [user]);

  return (
    <>
      <HeaderBack title="Editar usuário" />
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
                defaultValue={user?.name}
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
              {AllStates && !isPendingGetAllStates && (
                <Controller
                  control={control}
                  name="state"
                  defaultValue={user?.state}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      key={`select-state-${value}`}
                      isError={errors.state ? true : false}
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
                      label="Digite seu estado:"
                      placeholder="Estado"
                      value={value}
                    />
                  )}
                />
              )}
            </View>
            <View>
              {(Municipality || user?.city) && !isPendingMunicipality && (
                <Controller
                  control={control}
                  name="city"
                  defaultValue={user?.city}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      key={`select-municipality-${value}`}
                      isError={errors.city ? true : false}
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
                      label="Digite sua cidade:"
                      placeholder="Cidade"
                      value={value}
                    />
                  )}
                />
              )}
            </View>

            <Checkbox
              onPress={(isChecked) => setValue('isReceptor', isChecked)}
              placeholder="Selecione se você deseja receber doações!!"
              isChecked={watch('cpf') || watch('isReceptor') ? true : false}
            />

            {watch('isReceptor') && (
              <>
                <View>
                  <Controller
                    control={control}
                    name="cpf"
                    defaultValue={user?.cpf}
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
                    defaultValue={
                      user?.pix?.key
                        ? { key: user?.pix?.key, type_pix: user?.pix?.type }
                        : { key: '', type_pix: '' }
                    }
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
                            value={user?.pix?.type || watch('pix.type_pix')}
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
              onPress={handleSubmit(() => {
                console.log('oi');
                mutate();
              })}
              icon={{
                name: 'arrow-right',
                size: 20,
                color: '#fff',
              }}
              isLoading={isPending}>
              Atualizar
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
