import { View } from 'react-native';
import { Button, IconButtonComponent } from '~/components/Button';

type Selected = 'posts' | 'conversations' | 'notifications' | 'posts' | 'undefined';

export const CreateTopNavigationHome = ({
  selected,
  referencePageview,
  isNotificationConversations,
  isNotificationNotifications,
  isNotificationPostations,
  isBack,
  isBackRight,
}: {
  selected: Selected;
  referencePageview: any;
  isNotificationPostations?: boolean;
  isNotificationConversations?: boolean;
  isNotificationNotifications?: boolean;
  isBack?: boolean;
  isBackRight?: boolean;
}) => {
  return (
    <>
      <View className={`w-full justify-between rounded-lg flex gap-2  p-1 mb-4 flex-row`}>
        {isBack && !isBackRight && (
          <>
            <SelectedButton
              isSelected={selected === 'undefined'}
              icon={selected === 'posts' ? 'arrow-right' : 'arrow-left'}
              onPress={() => {
                if (selected !== 'undefined') referencePageview.current?.setPage(1);
              }}
              isNotification={isNotificationPostations}>
              Voltar
            </SelectedButton>
          </>
        )}
        {(selected == 'undefined' || selected == 'posts') && (
          <SelectedButton
            isSelected={selected === 'posts'}
            icon={'bookmark'}
            onPress={() => {
              if (selected !== 'posts') referencePageview.current?.setPage(0);
            }}>
            Postagens salvas
          </SelectedButton>
        )}
        {(selected === 'undefined' || selected === 'conversations') && (
          <SelectedButton
            isSelected={selected === 'conversations'}
            icon={'envelope'}
            onPress={() => {
              if (selected !== 'conversations') referencePageview.current?.setPage(2);
            }}
            isNotification={isNotificationConversations}>
            Conversas
          </SelectedButton>
        )}
        {isBack && isBackRight && (
          <>
            <SelectedButton
              isSelected={selected === 'undefined'}
              icon={selected === 'posts' ? 'arrow-right' : 'arrow-left'}
              onPress={() => {
                if (selected !== 'undefined') referencePageview.current?.setPage(1);
              }}
              isNotification={isNotificationPostations}>
              Voltar
            </SelectedButton>
          </>
        )}
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
  className,
}: {
  onPress?: () => void;
  isSelected: boolean;
  icon: IconButtonComponent['name'];
  children: React.ReactNode;
  isNotification?: boolean;
  className?: string;
}) => {
  return (
    <>
      <Button
        onPress={onPress}
        variant={isSelected ? 'default' : 'ghost'}
        className={`${isNotification && !isSelected ? 'bg-red-100' : ''} ${className}`}
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
