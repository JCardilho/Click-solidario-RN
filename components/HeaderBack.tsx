import { FontAwesome } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Divider } from './Divider';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';

interface IProps {
  title?: string;
  children?: ReactNode;
  hiddenDescriptionReturn?: boolean;
  buttonRounded?: boolean;
}

export const HeaderBack = (props: IProps) => {
  const router = useRouter();

  return (
    <>
      <SafeAreaView />
      <View className="w-full h-full max-h-[80px] ">
        <View className="w-full h-full  rounded-lg flex flex-row gap-2 items-center justify-start p-2">
          <Button
            variant={props.buttonRounded ? 'rounded' : 'ghost'}
            href={() => router.back()}
            icon={{
              name: 'arrow-left',
              color: props.buttonRounded ? 'black' : 'black',
              size: 15,
            }}
            loaderColor="#000000"
            className={props.buttonRounded ? 'bg-transparent' : ''}
            hiddenChildren={props.hiddenDescriptionReturn}>
            {props.hiddenDescriptionReturn ? '' : 'Voltar'}
          </Button>

          {props.title && (
            <ScrollView horizontal>
              <Text className="font-kanit text-xl p-4 w-full rounded-lg">{props.title}</Text>
            </ScrollView>
          )}

          {props.children && !props.title && props.children}
        </View>
      </View>
    </>
  );
};
