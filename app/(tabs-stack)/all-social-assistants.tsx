import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ScrollView, View } from 'react-native';
import { useNotifications } from 'react-native-notificated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { SkeletonContent, SkeletonRect } from '~/components/Skeleton';
import { UserService } from '~/utils/services/UserService';

export default function AllSocialAssistantsScreen() {
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const WD = useWindowDimensions();
  const { notify } = useNotifications();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['social-assistants'],
    queryFn: async () => {
      const result = await UserService.GetAllSocialAssistants();
      return result;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ['remove-social-assistant'],
    mutationFn: async () => {
      if (!selectedUid) return;
      const result = await UserService.DeleteSocialAssistant(selectedUid);
      return result;
    },
    onSuccess: () => {
      notify('success', {
        params: {
          title: 'Sucesso!!',
          description: 'Assistente social removido com sucesso',
        },
      });
      router.back();
    },
    onError: (err) => {
      console.log('err', err);
      notify('error', {
        params: {
          title: 'Erro ao remover assistente social',
          description: 'Erro ao remover assistente social, tente novamente mais tarde',
        },
      });
    },
  });

  const RemoveAssitantBottomSheet = useBottomSheetHook({
    button: {
      onPress: () => mutate(),
      isLoading: isPending,
      variant: 'destructive',
    },
    isNeedConfirm: true,
    textNeedConfirm: 'Você tem certeza que deseja remover esse assistente social?',
    textNeedConfirmButton: 'Remover',
  });

  useEffect(() => {
    if (selectedUid) RemoveAssitantBottomSheet.open();
  }, [selectedUid]);

  return (
    <>
      <HeaderBack title="Todos os assistentes sociais" />
      <RemoveAssitantBottomSheet.BottomSheet />
      <View className="p-4">
        {isLoading && (
          <>
            <View
              className="w-full h-screen"
              style={{
                height: WD.height,
              }}>
              <SkeletonContent>
                <SkeletonRect height={85} y={0 * 95} />
                <SkeletonRect height={85} y={1 * 95} />
                <SkeletonRect height={85} y={2 * 95} />
                <SkeletonRect height={85} y={3 * 95} />
                <SkeletonRect height={85} y={4 * 95} />
                <SkeletonRect height={85} y={5 * 95} />
                <SkeletonRect height={85} y={6 * 95} />
              </SkeletonContent>
            </View>
          </>
        )}

        {!isLoading && (
          <ScrollView className="w-full flex flex-col gap-4">
            {data?.map((user) => (
              <View
                key={user.uid + Math.random() * 1000}
                className="w-full p-4 bg-blue-100 border-2 border-blue-200 rounded-lg flex flex-row justify-between items-center mb-4">
                <View className=" flex flex-col gap-2">
                  <Text className="font-kanit text-blue-600 text-lg">{user.email}</Text>
                </View>
                <View className="flex flex-col gap-2 items-end justify-end">
                  <Button
                    variant="destructive"
                    icon={{
                      name: 'trash',
                      color: 'white',
                      size: 15,
                    }}
                    isLoading={isPending}
                    onPress={() => setSelectedUid(user.uid)}>
                    Remover
                  </Button>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </>
  );
}
