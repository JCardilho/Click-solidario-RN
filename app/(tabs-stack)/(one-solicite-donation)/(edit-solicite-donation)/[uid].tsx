import { FontAwesome } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { Loader, useLoaderHook } from '~/components/Loader';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useReserveDonations } from '~/utils/hooks/screens/view-reserve-donation/view-reserve-donation';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

const createSoliciteItemsSchema = z.object({
  name: z.string({
    required_error: 'Nome é obrigatório',
  }),
  description: z.string({
    required_error: 'Descrição é obrigatória',
  }),
  image: z.array(z.string()),
});

type CreateSoliciteItemsType = z.infer<typeof createSoliciteItemsSchema>;

export default function EditOneSoliciteDonation() {
  const { uid } = useLocalSearchParams();
  const { user } = useCurrentUserHook();
  const router = useRouter();
  const {
    setIsLoading,
    mutation: { startLoadingForUseMutation },
    stopLoadingForReactQueryError,
    stopLoadingForReactQuerySuccess,
  } = useLoaderHook();

  const { data, refetch } = useQuery<ISoliciteDonation>({
    queryKey: ['reserve-donation-edit', uid],
    queryFn: async () => {
      setIsLoading(true);
      const uidFormatted = Array.isArray(uid) ? uid[0] : uid;
      if (!uidFormatted) throw new Error('UID não encontrado');

      const result = await SoliciteDonationsSerivce.GetOneSoliciteDonations(uidFormatted);
      if (!result) throw new Error('Reserva não encontrada');
      setValue('image', result.images || ([] as any));
      setIsLoading(false);
      return result;
    },
  });

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSoliciteItemsType>({
    resolver: zodResolver(createSoliciteItemsSchema),
  });

  const { mutate: pickImages } = useMutation<string | undefined | null>({
    mutationKey: ['uploadImage'],
    mutationFn: async () => {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        aspect: [4, 3],
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        if (!data?.uid) return;
        result.assets.map(async (image) => {
          const response = await SoliciteDonationsSerivce.AddImages(data?.uid, image.uri);
          if (!response) return;
          setValue('image', getValues('image') ? [...getValues('image'), response] : [response]);
          setIsLoading(false);
          return response;
        });
      }
      return undefined;
    },

    ...startLoadingForUseMutation,
    ...stopLoadingForReactQueryError,
  });

  const { mutate: removeImage } = useMutation({
    mutationKey: ['remove-image', uid],
    mutationFn: async (index: number) => {
      const images = getValues('image');
      if (!data?.uid) return;
      await SoliciteDonationsSerivce.DeleteImage(images[index], data?.uid);
      images.splice(index, 1);
      setValue('image', images);
      return images;
    },
    onSuccess: (response) => {
      if (!response || !data || !data.uid) return;
      setIsLoading(false);
    },
    ...startLoadingForUseMutation,
    ...stopLoadingForReactQueryError,
  });

  const { mutate: mutateAddImage, isPending: isPendingAddImage } = useMutation({
    mutationKey: ['update-solicite-donation', uid],
    mutationFn: async (data: ISoliciteDonation) => {
      const result = await SoliciteDonationsSerivce.UpdateUpdateDonation(data.uid, data);
      return result;
    },
    onSuccess: (data) => {
      if (!data) return undefined;
      router.back();
    },
  });

  return (
    <>
      <HeaderBack title="Editar item" />
      <Loader fullscreen activeHook />
      {data && (
        <>
          <ScrollView>
            <View className="px-2 flex flex-col gap-4">
              <Controller
                control={control}
                name="name"
                defaultValue={data.name}
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
                defaultValue={data.description}
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

              <View className="w-full items-center justify-center">
                <Button
                  variant="success"
                  className=" w-full"
                  icon={{
                    name: 'save',
                    color: 'white',
                    size: 15,
                  }}
                  isLoading={isPendingAddImage}
                  onPress={handleSubmit(() =>
                    mutateAddImage({
                      ...data,
                      name: getValues('name'),
                      description: getValues('description'),
                      images: getValues('image'),
                    })
                  )}>
                  Salvar nome e descrição
                </Button>
              </View>
              <View>
                <Button
                  variant="default"
                  className="mb-4"
                  onPress={pickImages}
                  icon={{
                    name: 'plus',
                    color: 'white',
                    size: 15,
                  }}>
                  Adicionar Imagem
                </Button>
              </View>
              <Text className="text-red-500 font-kanit text-center">
                As imagens são atualizadas conforme você adiciona ou remove
              </Text>

              {watch('image') && watch('image')!.length < 1 && (
                <Text>Nenhuma imagem selecionada</Text>
              )}

              {watch('image') && watch('image')!.length > 0 && (
                <ScrollView
                  className="flex flex-row gap-4 w-full"
                  horizontal={true}
                  showsHorizontalScrollIndicator={true}>
                  {watch('image')!.map((image, index) => (
                    <TouchableOpacity
                      key={index + image.toString() + Math.random() * 1000}
                      onPress={() => removeImage(index)}
                      className=" flex flex-col items-center justify-center">
                      <Text className="font-kanit text-red-500">Toque para remover</Text>
                      <Image
                        source={{ uri: image }}
                        className="w-[150px] h-[150px] rounded-lg border-2 border-primary m-2"
                        alt="image"
                      />
                    </TouchableOpacity>
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
          </ScrollView>
        </>
      )}
    </>
  );
}
