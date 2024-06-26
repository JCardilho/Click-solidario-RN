import { FontAwesome } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { collection, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { useNotifications } from 'react-native-notificated';
import { z } from 'zod';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { IncompleteRegisterScreen } from '~/components/incompleteRegisterScreen';
import firebase from '~/utils/firebase';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { LocationService } from '~/utils/services/LocationService';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

const createSoliciteDonationSchema = z.object({
  name: z.string({
    required_error: 'Nome é obrigatório',
  }),
  description: z.string({
    required_error: 'Descrição é obrigatória',
  }),
  state: z.string().optional(),
  city: z.string().optional(),
  image: z.array(z.string()),
});

type CreateSoliciteDonationType = z.infer<typeof createSoliciteDonationSchema>;

export default function CreateSoliciteDonation() {
  const router = useRouter();
  const { user } = useCurrentUserHook();
  const [submitRef, setSubmit] = useState(false);
  const { notify } = useNotifications();

  const {
    control,
    getValues,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSoliciteDonationType>({
    resolver: zodResolver(createSoliciteDonationSchema),
  });

  const { isPending, mutate } = useMutation<ISoliciteDonation | undefined>({
    mutationKey: ['createSoliciteDonation'],
    mutationFn: async () => {
      if (!user || !user.uid) return;

      const city = getValues('city') ? getValues('city') : user.city;
      const state = getValues('state') ? getValues('state') : user.state;

      const result = await SoliciteDonationsSerivce.CreateSoliciteDonation({
        description: getValues('description'),
        name: getValues('name'),
        images: [],
        ownerUid: user.uid,
        ownerName: user.name,
        city: city || '',
        state: state || '',
      });

      return result;
    },
    onSuccess: async (data) => {
      if (!data) return;
      mutateAddImage(data);
    },
    onError: (error) => {
      console.log('error', error);
    },
  });

  const { mutate: mutateAddImage, isPending: isPendingAddImage } = useMutation({
    mutationKey: ['addImage'],
    mutationFn: async (data: ISoliciteDonation) => {
      console.log('data', data);
      if (!getValues('image')) return;
      const images = getValues('image');
      if (!images) return;
      const urls = images.map(async (uploading) => {
        if (!uploading) return;
        try {
          const response = await fetch(uploading);
          const blob = await response.blob();
          const fileName = uploading.substring(uploading.lastIndexOf('/') + 1);
          const storage = getStorage();
          console.log('disponibilizando', data?.uid);
          const mountainsRef = ref(
            storage,
            `images/solicite-donations/${data?.uid}/${fileName + Date.now().toString()}`
          );

          const result = await uploadBytes(mountainsRef, blob).then(async (snapshot) => {
            console.log('Uploaded a blob or file!', snapshot.ref.fullPath);
            const downloadUrl = await getDownloadURL(snapshot.ref).then(async (url) => {
              return url;
            });
            return downloadUrl;
          });
          return result;
        } catch (err) {
          console.log('err', err);
        }
      });

      return Promise.all(urls).then(async (urls) => {
        const db = getFirestore();
        const docRef = doc(db, 'solicite-donations', data?.uid);
        await setDoc(docRef, { images: urls }, { merge: true });
      });
    },
    onSuccess: (data) => {
      router.back();
    },
  });

  const pickImages = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      aspect: [4, 3],
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setValue(
        'image',
        getValues('image')
          ? [...getValues('image')!, ...result.assets.map((image) => image.uri)]
          : result.assets.map((image) => image.uri)
      );
    }
  };

  const { BottomSheet, open } = useBottomSheetHook({
    button: {
      onPress: () => {
        mutate();
      },
      isLoading: isPending,
      variant: 'success',
    },
    isNeedConfirm: true,
    textNeedConfirm: 'Você deseja confirmar a solicitação desse item à doação?',
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

  useEffect(() => {
    if (user && user.state) GetMunicipalityMutate(user.state);
  }, [user]);

  if (!user || (user && !user.cpf)) return <IncompleteRegisterScreen />;

  return (
    <>
      <BottomSheet />
      <HeaderBack title="Solicitar item" />
      <ScrollView className="w-full flex flex-col">
        <View className="">
          <View className="px-2 flex flex-col gap-4">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    placeholder="Nome"
                    label="Nome do item: "
                    onChangeText={field.onChange}
                    error={error?.message}
                    value={field.value}
                  />
                </>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    placeholder="Descrição"
                    label="Descrição do item: "
                    onChangeText={field.onChange}
                    isTextArea={true}
                    error={error?.message}
                    value={field.value}
                  />
                </>
              )}
            />

            <View>
              {AllStates && !isPendingGetAllStates && (
                <Controller
                  control={control}
                  name="state"
                  defaultValue={user?.state || ''}
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
                  defaultValue={user?.city || ''}
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

            {watch('image') && watch('image')!.length < 1 && (
              <Text>Nenhuma imagem selecionada</Text>
            )}

            <View>
              <Button
                variant="default"
                className="mb-4"
                onPress={pickImages}
                icon={{
                  name: 'image',
                  color: 'white',
                  size: 15,
                }}>
                Adicionar Imagem
              </Button>
            </View>

            {watch('image') && watch('image')!.length > 0 && (
              <ScrollView
                className="flex flex-row gap-4 "
                horizontal={true}
                showsHorizontalScrollIndicator={true}>
                {watch('image')!.map((image, index) => (
                  <Image
                    source={{ uri: image }}
                    className="w-[150px] h-[150px] rounded-lg border-2 border-primary m-2"
                    key={index}
                    alt="image"
                  />
                ))}
              </ScrollView>
            )}

            {(watch('image') && watch('image')!.length < 1) ||
              (!watch('image') && (
                <View className="flex flex-col gap-4 bg-zinc-100 border border-zinc-200 rounded items-center justify-center w-full h-[150px]">
                  <FontAwesome name="image" size={50} color="#9b9b9b" />
                  <Text className="text-2xl font-kanit text-zinc-400">
                    Nenhuma imagem selecionada!!
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
      <View className="w-full p-4 fixed bottom-4">
        {(!getValues('image') || !watch('description') || !watch('name')) && (
          <>
            <Text className="text-red-500 text-center font-kanit">Preencha todos os campos!!</Text>
          </>
        )}
        <Button
          onPress={open}
          variant="success"
          className="w-full mt-2"
          disabled={!getValues('image') || !watch('name') || !watch('description')}
          icon={{
            name: 'check-circle-o',
            color: 'white',
            size: 15,
          }}
          isLoading={isPending || isPendingAddImage}>
          Finalizar
        </Button>
      </View>
    </>
  );
}
