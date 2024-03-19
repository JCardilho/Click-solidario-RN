import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { getDatabase, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import firebase from '~/utils/firebase';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { IReserveDonationMessageRealTime } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';

type IVariant = 'you' | 'other';

interface ICardProps {
  children: React.ReactNode;
  ownerName: string;
  variant: IVariant;
}

const Card = (props: ICardProps) => {
  return props.variant === 'you' ? (
    <View className="w-full items-end mt-4 flex-col">
      <Text className="font-kanit text-zinc-600">{props.ownerName}</Text>
      <View className="w-auto bg-blue-500 rounded-lg p-4">
        <Text className="text-white text-lg font-kanit max-w-full flex-wrap text-justify">
          {props.children}
        </Text>
      </View>
    </View>
  ) : (
    <View className="w-full items-start mt-4 flex-col">
      <Text className="font-kanit text-zinc-600">{props.ownerName}</Text>
      <View className="w-auto bg-zinc-200 rounded-lg p-4">
        <Text className=" text-lg font-kanit max-w-full flex-wrap text-justify">
          {props.children}
        </Text>
      </View>
    </View>
  );
};

export default function Chat() {
  const [message, setMessage] = useState('');
  const { user } = useCurrentUserHook();
  const params = useLocalSearchParams<{
    current_user_uid: string;
    reserve_owner_uid: string;
  }>();
  const db = getDatabase(firebase);

  const { data, refetch } = useQuery<IReserveDonationMessageRealTime[]>({
    queryKey: ['messages', params.reserve_owner_uid],
    queryFn: async () => {
      if (!user?.uid || !params.reserve_owner_uid) return [];
      const result = await ReserveDonationsService.GetMyMessages(
        user?.uid,
        params.reserve_owner_uid
      );
      return result;
    },
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ['send-message-to-reserve-owner', params.reserve_owner_uid],
    mutationFn: async (message: string) => {
      if (!user || !user.uid || !params.reserve_owner_uid) return;
      const result = await ReserveDonationsService.CreateMessage({
        message,
        uid: user.uid,
        ownerUid: params.reserve_owner_uid,
      });
      setMessage('');
      return result;
    },
    onError: (error) => {
      console.log('error', error);
    },
  });

  useEffect(() => {
    if (user) {
      const watch = async () => {
        await ReserveDonationsService.WatchEventMessage(params.reserve_owner_uid, user.uid);
      };
      watch();
    }
  }, []);

  return (
    params.current_user_uid &&
    params.reserve_owner_uid &&
    user &&
    user.uid === params.current_user_uid && (
      <>
        <HeaderBack title="Chat" />
        <ScrollView className="h-[1500px] w-full px-4 pb-12 flex-col gap-4">
          <Card ownerName="Você" variant="you">
            Olá, tudo bem? Gostaria de saber mais sobre o item.
          </Card>
          <Card ownerName="Você" variant="you">
            Olá, tudo bem?
          </Card>
          <Card ownerName="Você" variant="you">
            Gostaria de saber mais sobre o item.
          </Card>
          <Card ownerName="Pessoa" variant="other">
            Gostaria de saber mais sobre o item.
          </Card>
          <Card ownerName="Pessoa" variant="other">
            Gostaria de saber mais sobre o item.
          </Card>
          <Card ownerName="Pessoa" variant="other">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis ipsa repellat,
            assumenda repellendus atque nemo quae nulla minima quod voluptatibus nobis iure totam
            odio iste numquam voluptas adipisci optio veniam?
          </Card>
          <Card ownerName="Você" variant="you">
            Gostaria de saber mais sobre o item.
          </Card>
        </ScrollView>
        <View className=" w-full items-center justify-center z-20 bg-white px-2 flex-row gap-2 p-2">
          <Input
            placeholder="Digite sua mensagem"
            className="w-[72%]"
            isTextArea
            onChangeText={(text) => setMessage(text)}
            value={message}
          />
          <Button
            icon={{
              name: 'send',
              color: 'white',
              size: 15,
            }}
            className="h-full"
            isLoading={isPending}
            onPress={() => {
              mutate(message);
            }}>
            Enviar
          </Button>
        </View>
      </>
    )
  );
}
