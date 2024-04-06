import { ScrollView, Text, Dimensions } from 'react-native';
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
  const width = Dimensions.get('window').width;

  return (
    <ScrollView className="p-4" key="1">
      <CreateTopNavigationHome
        selected="undefined"
        referencePageview={props.referencePageview}
        isNotificationConversations={props.notificationTopNavigation?.conversations}
      />

      <View className="w-full flex items-center justify-center">
        <Text className="font-montserrat font-bold text-4xl text-center mt-2">Postagenss</Text>
        
      </View>
    </ScrollView>
  );
};