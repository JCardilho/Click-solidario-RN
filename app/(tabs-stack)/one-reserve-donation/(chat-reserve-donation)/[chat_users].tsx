import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { getDatabase, onValue, ref } from 'firebase/database';
import { Fragment, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Button } from '~/components/Button';
import { HeaderBack } from '~/components/HeaderBack';
import { Input } from '~/components/Input';
import { SkeletonContent, SkeletonRect } from '~/components/Skeleton';
import firebase from '~/utils/firebase';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { IReserveDonationMessageRealTime } from '~/utils/services/DTO/reserve-donation.dto';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { UserService } from '~/utils/services/UserService';

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
    receives_donation_uid: string;
    receives_donation_name: string;
    reserve_owner_name: string;
  }>();
  const [data, setMessages] = useState<IReserveDonationMessageRealTime['messages']>([]);
  const scrollRef = useRef<ScrollView>(null);

  const { refetch, isPending: isPendingMessage } = useQuery<any>({
    queryKey: ['messages', params.reserve_owner_uid],
    queryFn: async () => {
      try {
        if (!user) return [];
        const value = await ReserveDonationsService.GetMyMessages(
          params?.receives_donation_uid,
          params.reserve_owner_uid
        );

        await UserService.MarkAsReadChatNotification({
          uid: user.uid,
          OtherUserUid:
            user!.uid === params.reserve_owner_uid
              ? params.receives_donation_uid
              : params.reserve_owner_uid,
        });

        if (!value || (value && value.length < 1)) return [];

        ReserveDonationsService.WatchEventMessage(
          params?.receives_donation_uid,
          params.reserve_owner_uid,
          (data) => {
            if (data && data.exists() && data.val()) {
              const value: IReserveDonationMessageRealTime = data.val();

              setMessages(value.messages);
              return [];
            }
            throw new Error('Data not found');
          }
        );
      } catch (err) {
        console.log('Error', err);
        return [];
      }

      return 'OK';
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current!.scrollToEnd();
    }
  }, [data]);

  const { isPending, mutate } = useMutation({
    mutationKey: ['send-message-to-reserve-owner', params.reserve_owner_uid],
    mutationFn: async (message: string) => {
      if (!user || !user.uid || !params.reserve_owner_uid || !message) return;
      const result = await ReserveDonationsService.CreateMessage({
        messages: [
          {
            text: message,
            owner_message_uid: params?.current_user_uid,
            createdAt: format(new Date(), 'dd-MM-yyyy HH:mm:ss'),
          },
        ],
        uid_person_reserve: params?.receives_donation_uid,
        uid_person_donation: params.reserve_owner_uid,
      });
      if (data && data.length === 0) refetch();
      setMessage('');
      return result;
    },
    onError: (error) => {
      console.log('error', error);
    },
    onSuccess: async () => {
      if (!user || !user.uid) return;
      await UserService.MarkAsUnreadOtherUserChatNotification({
        uid: user!.uid,
        OtherUserUid:
          user!.uid === params.reserve_owner_uid
            ? params.receives_donation_uid
            : params.reserve_owner_uid,
      });
    },
  });

  const { width } = useWindowDimensions();

  const GapPerMessage = 10;

  return (
    params.current_user_uid &&
    params.reserve_owner_uid &&
    user &&
    user.uid === params.current_user_uid && (
      <>
        <HeaderBack title="Chat" />
        {isPendingMessage && (
          <View className="w-full h-screen p-4">
            <SkeletonContent>
              <SkeletonRect width={Math.floor(Math.random() * 50) + 200} height={50} y={0} />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 200}
                height={20}
                y={(50 + GapPerMessage) * 1}
              />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 200}
                height={30}
                y={(50 + 20 + GapPerMessage) * 1.1}
                x={width - 300}
              />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 150}
                height={70}
                y={(50 + 20 + 30 + GapPerMessage) * 1.2}
              />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 200}
                height={20}
                y={(50 + 20 + 30 + 70 + GapPerMessage) * 1.25}
                x={width - 300}
              />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 300}
                height={50}
                y={(50 + 20 + 30 + 70 + 20 + GapPerMessage) * 1.3}
                x={width - 300}
              />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 300}
                height={20}
                y={(50 + 20 + 30 + 70 + 20 + 50 + GapPerMessage) * 1.35}
                x={width - 300}
              />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 150}
                height={70}
                y={(50 + 20 + 30 + 70 + 20 + 50 + 20 + GapPerMessage) * 1.4}
              />
              <SkeletonRect
                width={Math.floor(Math.random() * 50) + 150}
                height={45}
                y={(50 + 20 + 30 + 70 + 20 + 50 + 20 + 70 + GapPerMessage) * 1.45}
              />
            </SkeletonContent>
          </View>
        )}

        {!isPendingMessage && (
          <>
            <ScrollView className="h-[1500px] w-full px-4 pb-12 flex-col gap-4" ref={scrollRef}>
              {data &&
                data.map((messages) =>
                  messages.owner_message_uid === user.uid ? (
                    <Card
                      ownerName="Você"
                      variant="you"
                      key={messages.createdAt + messages.text + messages.owner_message_uid}>
                      {messages.text}
                    </Card>
                  ) : (
                    <Card
                      ownerName={
                        user && user.uid === params.reserve_owner_uid
                          ? params.reserve_owner_name
                          : params.reserve_owner_name
                      }
                      variant="other"
                      key={messages.createdAt + messages.text + messages.owner_message_uid}>
                      {messages.text}
                    </Card>
                  )
                )}

              <View className="h-[35px] w-full bg-transparent"></View>
            </ScrollView>
          </>
        )}

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
