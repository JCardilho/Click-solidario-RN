import { Link, Stack, useRouter } from 'expo-router';
import _default from 'react-hook-form/dist/utils/get';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, IPropsButtomComponent, IconButtonComponent } from '~/components/Button';
import { useBottomSheetHook } from '~/components/BottomSheet';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvent, useHandler } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '~/utils/services/UserService';
import { IUser } from '~/utils/services/DTO/user.dto';
import { FontAwesome } from '@expo/vector-icons';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import * as Burnt from 'burnt';
import { useNotifications } from 'react-native-notificated';

const SelectedButton = ({
  onPress,
  isSelected,
  children,
  icon,
  isNotification,
}: {
  onPress?: () => void;
  isSelected: boolean;
  icon: IconButtonComponent['name'];
  children: React.ReactNode;
  isNotification?: boolean;
}) => {
  return (
    <>
      <Button
        onPress={onPress}
        variant={isSelected ? 'default' : 'ghost'}
        className={`${isNotification && !isSelected ? 'bg-red-100' : ''}`}
        classNameText={` ${isNotification && !isSelected ? 'text-red-500' : 'text-black'}`}
        icon={{
          name: icon || 'envelope',
          color: isSelected ? 'white' : isNotification ? 'red' : 'black',
          size: 15,
        }}>
        {children}
      </Button>
    </>
  );
};

type Selected = 'posts' | 'conversations' | 'notifications';

const CreateTopNavigation = ({
  selected,
  referencePageview,
  isNotificationConversations,
  isNotificationNotifications,
  isNotificationPostations,
  isBack,
}: {
  selected: Selected;
  referencePageview: any;
  isNotificationPostations?: boolean;
  isNotificationConversations?: boolean;
  isNotificationNotifications?: boolean;
  isBack?: boolean;
}) => {
  return (
    <>
      <View
        className={`w-full ${isBack ? 'justify-between' : 'justify-end'} rounded-lg flex flex-row gap-2  p-1 mb-4`}>
        {isBack && (
          <>
            <SelectedButton
              isSelected={selected === 'posts'}
              icon={'arrow-left'}
              onPress={() => {
                if (selected !== 'posts') referencePageview.current?.setPage(0);
              }}
              isNotification={isNotificationPostations}>
              Voltar
            </SelectedButton>
          </>
        )}
        <SelectedButton
          isSelected={selected === 'conversations'}
          icon={'envelope'}
          onPress={() => {
            if (selected !== 'conversations') referencePageview.current?.setPage(1);
          }}
          isNotification={isNotificationConversations}>
          Conversas
        </SelectedButton>
      </View>
    </>
  );
};

export default function Home() {
  const { user } = useCurrentUserHook();
  const { notify } = useNotifications();
  const router = useRouter();
  const [notificationTopNavigation, setNotificationTopNavigation] = useState<{
    conversations: boolean;
    notifications: boolean;
    posts: boolean;
  }>();
  const { BottomSheet, open } = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      variant: 'success',
    },
    textNeedConfirm: 'Você deseja confirmar essa alteração? Esse é um caminho sem volta!!',
  });

  const ref = useRef<PagerView>(null);

  const { data, refetch } = useQuery<IUser['conversations']>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user?.uid) throw new Error('Usuário não encontrado');
      /* router.dismissAll(); */
/*       router.canGoBack(); */
      const result = await UserService.GetAllConversations(user?.uid);
      return result;
    },
  });

  const verifyNotificationConversations = (conversation: IUser['conversations']) => {
    if (!conversation || !conversation) return false;
    const isNotification = conversation.some((message) => message.isNotification);
    console.log('retornando', isNotification);
    return isNotification;
  };

  useEffect(() => {
    if (!data) return;
    setNotificationTopNavigation({
      conversations: verifyNotificationConversations(data),
      notifications: false,
      posts: false,
    });
  }, [data]);

  useRefreshOnFocus(refetch);

  return (
    <>
      <SafeAreaView />
      <BottomSheet />
      <PagerView
        style={stylesS.viewPager}
        initialPage={0}
        ref={ref}
        onPageSelected={(e) => {
          console.log(`Active page is ${e.nativeEvent.position}`);
        }}>
        <View className="w-full h-full p-4 items-start justify-start flex" key="1">
          <CreateTopNavigation
            selected="posts"
            referencePageview={ref}
            isNotificationConversations={notificationTopNavigation?.conversations}
          />
          <View className="w-full flex items-center justify-center">
            <Text className="font-montserrat font-bold text-4xl text-center mt-2">Postagens</Text>
          </View>
        </View>
        <View className="w-full h-full p-4 items-start justify-start flex" key="2">
          <CreateTopNavigation
            selected="conversations"
            referencePageview={ref}
            isNotificationConversations={notificationTopNavigation?.conversations}
            isBack
          />
          <View className="w-full flex flex-col gap-4">
            {data?.map((item) => (
              <TouchableOpacity
                key={item.routeQuery + Math.random() * 1000}
                className="w-full p-4 bg-blue-100 border-2 border-blue-200 rounded-lg flex flex-row justify-between items-center"
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
          </View>
        </View>
      </PagerView>
    </>
  );
}

const stylesS = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {},
});
