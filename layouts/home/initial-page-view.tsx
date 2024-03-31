import { ScrollView, Text } from 'react-native';
import { CreateTopNavigationHome } from './create-top-navigation';
import { View } from 'react-native';
import { SkeletonContent, SkeletorCircle } from '~/components/Skeleton';

interface IProps {
  referencePageview: any;
  notificationTopNavigation?: {
    conversations: boolean;
    notifications: boolean;
    posts: boolean;
  };
}

export const InitialPageView = (props: IProps) => {
  return (
    <ScrollView className="p-4" key="1">
      <CreateTopNavigationHome
        selected="posts"
        referencePageview={props.referencePageview}
        isNotificationConversations={props.notificationTopNavigation?.conversations}
      />

      <View className="w-full flex items-center justify-center">
        <Text className="font-montserrat font-bold text-4xl text-center mt-2">Postagens</Text>
      </View>
    </ScrollView>
  );
};
