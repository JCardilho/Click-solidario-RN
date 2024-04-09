import { ScrollView, Text, Dimensions, TouchableOpacity } from 'react-native';
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
import { useMemo, useState } from 'react';
import { Button } from '~/components/Button';
import { FontAwesome } from '@expo/vector-icons';

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
  const [take, setTake] = useState(5);

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
    <>
      <ZoomView />
      <ScrollView key="1">
        <CreateTopNavigationHome
          selected="undefined"
          referencePageview={props.referencePageview}
          isNotificationConversations={props.notificationTopNavigation?.conversations}
        />

        <View className="w-full p-4"></View>

        <View className="w-full h-auto flex flex-row items-center justify-around ">
          <TouchableOpacity
            className="w-fit h-auto flex flex-col gap-2 items-center justify-center"
            onPress={() => router.push('/(tabs-stack)/(my-donations)/reserve-donations')}>
            <View className="w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-black bg-zinc-100">
              <FontAwesome name="dropbox" size={30} color="#000" />
            </View>
            <Text className="text-center font-kanit text-lg w-24">Minhas solicitações</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-fit flex flex-col gap-2 items-center justify-center"
            onPress={() => router.push('/(tabs-stack)/(my-donations)/solicite-donations')}>
            <View className="w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-black bg-zinc-100">
              <FontAwesome name="user-plus" size={30} color="#000" />
            </View>
            <Text className="text-center font-kanit text-lg w-24">Minhas reservas</Text>
          </TouchableOpacity>
        </View>

        <View className="w-full px-4">
          <Divider margin="my-4" />
        </View>

        <View className="w-full flex items-center justify-center p-4">
          <Text className="font-kanit font-bold text-2xl text-center mb-4 text-zinc-500">
            Minhas solicitações
          </Text>

          {isPending && <Card isLoading={true} />}

          {!isPending &&
            data?.slice(0, take).map((item) => (
              <Card
                key={`${item.uid}-initial-page`}
                isRenderImage
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
                  ownerUid: item.ownerUid,
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

          <Button
            icon={{
              name: 'chevron-down',
              color: 'white',
              size: 20,
            }}
            onPress={() => setTake(take + 5)}>
            Ver mais
          </Button>
        </View>

        <View className="h-[250px] w-full"></View>
      </ScrollView>
    </>
  );
};
