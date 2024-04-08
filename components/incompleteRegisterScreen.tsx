import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { useRouter } from 'expo-router';

export const IncompleteRegisterScreen = () => {
  const router = useRouter();

  return (
    <View className="w-screen h-screen items-center justify-center gap-4">
      <FontAwesome name="exclamation-triangle" size={50} color="red" />
      <Text className="font-kanit text-lg text-center mt-4">
        Você precisa completar seu cadastro para acessar essa funcionalidade
      </Text>
      <Button
        variant="ghost"
        onPress={() => {
          router.replace('/edit-user');
        }}
        classNameText="text-primary font-bold underline">
        Completar cadastro
      </Button>
    </View>
  );
};
