import { FontAwesome } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Divider } from './Divider';

interface IProps {
  returnHref: () => void;
  title: string;
}

export const HeaderBack = (props: IProps) => {
  return (
    <>
      <SafeAreaView />
      <View className="w-full h-full max-h-[80px] ">
        <View className="w-full h-full  rounded-lg flex flex-row gap-2 items-center justify-start p-2">
          <Button
            variant="default"
            href={() => props.returnHref()}
            icon={{
              name: 'arrow-left',
              color: 'white',
              size: 15,
            }}>
            Voltar
          </Button>

          <Text className="font-kanit text-xl p-4 bg-white w-full rounded-lg">{props.title}</Text>
        </View>
      </View>
      <Divider margin="my-1 mb-4" color="bg-white" />
    </>
  );
};
