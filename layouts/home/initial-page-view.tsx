import { ScrollView, Text, Dimensions } from 'react-native';
import { CreateTopNavigationHome } from './create-top-navigation';
import { View } from 'react-native';
import { SkeletonContent, SkeletorCircle } from '~/components/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { Divider } from '~/components/Divider';
import { Card } from '~/components/Card';
import { useZoom } from '~/components/Zoom';
import { useRouter } from 'expo-router';

interface IProps {
  referencePageview: any;
  notificationTopNavigation?: {
    conversations: boolean;
    notifications: boolean;
    posts: boolean;
  };
}

export const InitialPageView = (props: IProps) => {
  const width = Dimensions.get('window').width;
  const { user } = useCurrentUserHook();
  const { ZoomTrigger, ZoomView } = useZoom();
  const router = useRouter();

  const { data, isPending } = useQuery({
    queryKey: ['get-posts'],
    queryFn: async () => {
      if (!user?.uid) return;
      const getAllSoliciteDonation = await SoliciteDonationsSerivce.GetAllSoliciteDonations(
        user?.uid,
        0,
        100,
        user?.state,
        user?.city
      );

      const getAllReserveDonation = await ReserveDonationsService.GetAllReserveDonations(
        user?.uid,
        0,
        100,
        user?.state,
        user?.city
      );

      const formattedGetAllSoliciteDonation = getAllSoliciteDonation.map((solicite) => {
        return {
          ...solicite,
          type: 'solicite',
        };
      });

      const formattedGetAllReserveDonation = getAllReserveDonation.donations.map((reserve) => {
        return {
          ...reserve,
          isVerified: false,
          type: 'reserve',
        };
      });

      const aleatoryPosts = [
        ...formattedGetAllSoliciteDonation,
        ...formattedGetAllReserveDonation,
      ].sort(() => Math.random() - 0.5);

      return aleatoryPosts;
    },
  });

  return (
    <ScrollView className="p-4" key="1">
      <CreateTopNavigationHome
        selected="undefined"
        referencePageview={props.referencePageview}
        isNotificationConversations={props.notificationTopNavigation?.conversations}
      />

      <ZoomView />

      <View className="w-full flex items-center justify-center">
        <Text className="font-montserrat font-bold text-4xl text-center mt-2">Postagens</Text>

        <Divider margin="my-4" />

        {isPending && (
          <View>
            <Card isLoading={true} />
          </View>
        )}

        {!isPending &&
          data?.map((item) => (
            <Card
              key={item.uid + Math.random() * 1000}
              item={{
                name: item.name,
                description: item.description,
                images: item.images as any,
                ownerName: item.ownerName,
                city: item.city,
                state: item.state,
                createdAt: item.createdAt,
                id: item.uid,
                type: item.type === 'solicite' ? 'solicite' : 'reserve',
              }}
              ZoomTrigger={ZoomTrigger}
              href={() => {
                if (item.type === 'solicite') {
                  router.push(
                    `/(tabs-stack)/(one-solicite-donation)/(view-solicite-donation)/${item.uid}`
                  );
                } else {
                  router.push(
                    `/(tabs-stack)/one-reserve-donation/(view-reserve-donation)/${item.uid}`
                  );
                }
              }}
              isVerified={item!.isVerified!}
            />
          ))}
      </View>
    </ScrollView>
  );
};
