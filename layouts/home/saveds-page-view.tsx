import { ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { CreateTopNavigationHome } from './create-top-navigation';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useNotifications } from 'react-native-notificated';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { IUser } from '~/utils/services/DTO/user.dto';
import { UserService } from '~/utils/services/UserService';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import { SkeletonContent, SkeletonRect } from '~/components/Skeleton';

interface IProps {
  referencePageview: any;
  notificationTopNavigation?: {
    conversations: boolean;
    notifications: boolean;
    posts: boolean;
  };
  setNotificationTopNavigation: Dispatch<SetStateAction<IProps['notificationTopNavigation']>>;
}

export const SavedsPageViewHomePage = (props: IProps) => {
  const { user, setUser } = useCurrentUserHook();
  const { notify } = useNotifications();
  const router = useRouter();
  const WD = useWindowDimensions();

  const { data, refetch, isLoading } = useQuery<IUser['posts_saved']>({
    queryKey: ['posts-saved'],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Usuário não encontrado');
      const result = await UserService.GetAllPostsSaved(user?.uid);
      setUser({
        ...user,
        posts_saved: result,
      });
      return result;
    },
    retry: 10,
  });

  useRefreshOnFocus(refetch);

  return (
    <ScrollView key={'0'} className="p-4">
      <CreateTopNavigationHome
        selected="posts"
        referencePageview={props.referencePageview}
        isBack
        isBackRight
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
              key={item.postId + item.type + Math.random() * 1000}
              className="w-full p-4 bg-blue-100 border-2 border-blue-200 rounded-lg flex flex-row justify-between items-center mb-4"
              onPress={() => {
                if (!user) return;
                const link =
                  item.type === 'solicite'
                    ? `/(tabs-stack)/(one-solicite-donation)/(view-solicite-donation)/${item.postId}`
                    : `/(tabs-stack)/one-reserve-donation/(view-reserve-donation)/${item.postId}`;
                router.push(link as any);
              }}>
              <View className=" flex flex-col gap-2">
                <Text className="font-kanit text-blue-600 text-lg">{item.postTitle}</Text>
                <Text className="font-kanit text-blue-600 text-lg">
                  {item.postDescription && item.postDescription.length > 200
                    ? item.postDescription.substr(0, 200) + '...'
                    : item.postDescription}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
};
