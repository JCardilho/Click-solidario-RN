import { FontAwesome } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useMutation } from '@tanstack/react-query';
import { MediaTypeOptions, launchImageLibraryAsync } from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { collection, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import firebase from '~/utils/firebase';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

const createDonationItemsSchema = z.object({
  name: z.string({
    required_error: 'Nome é obrigatório',
  }),
  description: z.string({
    required_error: 'Descrição é obrigatória',
  }),
  image: z.array(z.string().optional()),
});

type CreateDonationItemsType = z.infer<typeof createDonationItemsSchema>;

export default function CreateDonationItems() {
  const router = useRouter();
  const { user } = useCurrentUserHook();

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateDonationItemsType>({
    resolver: zodResolver(createDonationItemsSchema),
  });

  const { isPending, mutate } = useMutation<IReserveDonation | undefined>({
    mutationKey: ['createDonationItems'],
    mutationFn: async () => {
      console.log('vai passar pelo uid');
      if (!user || !user.uid) return;

      console.log('entrou');

      const result = await ReserveDonationsService.CreateReserveDonation({
        description: getValues('description'),
        name: getValues('name'),
        images: [],
        ownerUid: user.uid,
        ownerName: user.name,
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
    mutationFn: async (data: IReserveDonation) => {
      if (!getValues('image')) return;
      const images = getValues('image');
      const urls = await images.map(async (uploading) => {
        if (!uploading) return;
        try {
          const response = await fetch(uploading);
          const blob = await response.blob();
          const fileName = uploading.substring(uploading.lastIndexOf('/') + 1);
          const storage = getStorage();
          console.log('disponibilizando', data?.uid);
          const mountainsRef = ref(
            storage,
            `images/reserve-donations/${data?.uid}/${fileName + Date.now().toString()}`
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
        const docRef = doc(db, 'reserve-donations', data?.uid);
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
          ? [...getValues('image'), ...result.assets.map((image) => image.uri)]
          : result.assets.map((image) => image.uri)
      );
    }
  };

  return (
    <>
      <ScrollView>
        {/* <Stack.Screen
          options={{
            title: 'Disponibilizar um item à doação',
            headerShown: false,
          }}
        /> */}
        <HeaderBack title="Disponibilizar um item à doação" />
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
                />
              </>
            )}
          />

          {watch('image') && watch('image')!.length < 1 && <Text>Nenhuma imagem selecionada</Text>}

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
      </ScrollView>
      <View className="absolute bottom-4 full items-center justify-center px-2">
        <Button
          variant="success"
          className=" w-full"
          icon={{
            name: 'plus',
            color: 'white',
            size: 15,
          }}
          isLoading={isPending || isPendingAddImage}
          onPress={handleSubmit(() => mutate())}>
          Finalizar
        </Button>
      </View>
    </>
  );
}
