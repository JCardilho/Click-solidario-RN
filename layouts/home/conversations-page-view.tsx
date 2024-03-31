import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { CreateTopNavigationHome } from './create-top-navigation';
import { SkeletonContent, SkeletonRect } from '~/components/Skeleton';
import { TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { IUser } from '~/utils/services/DTO/user.dto';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useNotifications } from 'react-native-notificated';
import { useRouter } from 'expo-router';
import { UserService } from '~/utils/services/UserService';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';

interface IProps {
  referencePageview: any;
  notificationTopNavigation?: {
    conversations: boolean;
    notifications: boolean;
    posts: boolean;
  };
  setNotificationTopNavigation: Dispatch<SetStateAction<IProps['notificationTopNavigation']>>;
}

export const ConversationsPageView = (props: IProps) => {
  const { user, setUser } = useCurrentUserHook();
  const { notify } = useNotifications();
  const router = useRouter();
  const WD = useWindowDimensions();

  const { data, refetch, isLoading } = useQuery<IUser['conversations']>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Usuário não encontrado');
      const result = await UserService.GetAllConversations(user?.uid);
      setUser({
        ...user,
        conversations: result,
      });
      return result;
    },
    retry: 10,
  });

  const verifyNotificationConversations = (conversation: IUser['conversations']) => {
    if (!conversation || !conversation) return false;
    const isNotification = conversation.some((message) => message.isNotification);
    return isNotification;
  };

  useEffect(() => {
    if (!data) return;
    props.setNotificationTopNavigation({
      conversations: verifyNotificationConversations(data),
      notifications: false,
      posts: false,
    });
  }, [data]);

  useRefreshOnFocus(refetch);

  return (
    <View className="w-full h-full p-4 items-start justify-start flex" key="2">
      <CreateTopNavigationHome
        selected="conversations"
        referencePageview={props.referencePageview}
        isNotificationConversations={props.notificationTopNavigation?.conversations}
        isBack
      />

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
          {data?.map((item) => (
            <TouchableOpacity
              key={item.routeQuery + Math.random() * 1000}
              className="w-full p-4 bg-blue-100 border-2 border-blue-200 rounded-lg flex flex-row justify-between items-center mb-4"
              onPress={() => {
                if (!user) return;
                const link = `/(tabs-stack)/one-reserve-donation/(chat-reserve-donation)/${user.uid}${item.routeQuery}`;
                router.push(link as any);
              }}>
              <Text className="font-kanit text-blue-600 text-lg">{item.otherUserName}</Text>
              <View className="flex flex-col gap-2 items-end justify-end">
                {item.isNotification && (
                  <Text className="font-kanit text-red-500 text-md">
                    {' '}
                    Você tem uma nova mensagem
                  </Text>
                )}
                <Text className="font-kanit text-zinc-600">Clique</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
