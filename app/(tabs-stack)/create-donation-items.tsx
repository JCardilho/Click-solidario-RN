import { zodResolver } from '@hookform/resolvers/zod/src/zod';
import { useMutation } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

const createDonationItemsSchema = z.object({
  name: z.string({
    required_error: 'Nome é obrigatório',
  }),
  description: z.string({
    required_error: 'Descrição é obrigatória',
  }),
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
  } = useForm<CreateDonationItemsType>({
    resolver: zodResolver(createDonationItemsSchema),
  });

  const { isPending, mutateAsync, mutate } = useMutation({
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
      });

      return result;
    },
    onSuccess: (data) => {
      console.log('Um item foi disponibilizado', data);
      router.back();
    },
  });

  useEffect(() => {
    if (errors) {
      console.log('errors', errors);
    }
  }, [errors]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Disponibilizar um item à doação',
          headerShown: false,
        }}
      />
      <HeaderBack title="Disponibilizar um item à doação" returnHref={() => router.back()} />
      <View className="px-4 flex flex-col gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState: { error } }) => (
            <>
              <TextInput
                placeholder="Nome do item"
                className="border border-primary rounded-lg p-4"
                onChangeText={field.onChange}
              />
              {error && <Text>{error.message}</Text>}
            </>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState: { error } }) => (
            <>
              <TextInput
                placeholder="Descrição"
                className="border border-primary rounded-lg p-4"
                onChangeText={field.onChange}
              />
              {error && <Text>{error.message}</Text>}
            </>
          )}
        />

        {errors && (
          <Text className="text-red-500">
            {errors.name?.message || errors.description?.message}
          </Text>
        )}

        <Button
          variant="default"
          className="mt-4"
          icon={{
            name: 'plus',
            color: 'white',
            size: 15,
          }}
          isLoading={isPending}
          onPress={handleSubmit(() => mutate())}>
          Disponibilizar
        </Button>
      </View>
    </>
  );
}
