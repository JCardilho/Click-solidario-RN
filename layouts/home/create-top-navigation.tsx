import { View } from 'react-native';
import { Button, IconButtonComponent } from '~/components/Button';

type Selected = 'posts' | 'conversations' | 'notifications';

export const CreateTopNavigationHome = ({
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
