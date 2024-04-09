import { FontAwesome } from '@expo/vector-icons';
import { Text } from 'react-native';
import { View } from 'react-native';

export const NoneItemsScreen = () => {
  return (
    <View className="flex flex-col items-center justify-center h-screen w-full gap-4">
      <FontAwesome name="warning" size={75} color={'#5e5e5e'} />
      <Text className="text-xl font-kanit text-zinc-600">Nenhum item encontrado</Text>
    </View>
  );
};
