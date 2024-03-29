import { FontAwesome } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Divider } from './Divider';
import { useRouter } from 'expo-router';

interface IProps {
  title: string;
}

export const HeaderBack = (props: IProps) => {
  const router = useRouter();

  return (
    <>
      <SafeAreaView />
      <View className="w-full h-full max-h-[80px] ">
        <View className="w-full h-full  rounded-lg flex flex-row gap-2 items-center justify-start p-2">
          <Button
            variant="ghost"
            href={() => router.back()}
            icon={{
              name: 'arrow-left',
              color: 'black',
              size: 15,
            }}
            loaderColor="#000000">
            Voltar
          </Button>

          <Text className="font-kanit text-xl p-4 w-full rounded-lg">{props.title}</Text>
        </View>
      </View>
    </>
  );
};
