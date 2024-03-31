import _default from 'react-hook-form/dist/utils/get';
import { StyleSheet } from 'react-native';
import { useRef, useState } from 'react';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InitialPageView } from '~/layouts/home/initial-page-view';
import { ConversationsPageView } from '~/layouts/home/conversations-page-view';
import { SavedsPageViewHomePage } from '~/layouts/home/saveds-page-view';

export default function Home() {
  const [notificationTopNavigation, setNotificationTopNavigation] = useState<{
    conversations: boolean;
    notifications: boolean;
    posts: boolean;
  }>();

  const ref = useRef<PagerView>(null);

  return (
    <>
      <SafeAreaView />
      <PagerView style={stylesPageView.viewPager} initialPage={1} ref={ref}>
        <SavedsPageViewHomePage
          referencePageview={ref}
          notificationTopNavigation={notificationTopNavigation}
          setNotificationTopNavigation={setNotificationTopNavigation}
        />
        <InitialPageView
          referencePageview={ref}
          notificationTopNavigation={notificationTopNavigation}
        />
        <ConversationsPageView
          referencePageview={ref}
          notificationTopNavigation={notificationTopNavigation}
          setNotificationTopNavigation={setNotificationTopNavigation}
        />
      </PagerView>
    </>
  );
}

const stylesPageView = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  page: {},
});
