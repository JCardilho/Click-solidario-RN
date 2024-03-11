import { Link } from 'expo-router';
import _default from 'react-hook-form/dist/utils/get';
import { Text, TouchableOpacity, View } from 'react-native';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';

export default function Home() {
  const { user } = useCurrentUserHook();
  const { setCache } = useCacheHook();

  return (
    <View>
      <Text>Oi</Text>
      <TouchableOpacity
        className="w-full bg-blue-500 p-2  rounded-lg "
        onPress={() => {
          const verify = async () => {
            setCache('user', null);
          };
          verify();
        }}>
        <Text className="text-center text-white text-2xl">Limpar cache</Text>
      </TouchableOpacity>
      <Link href="/(tabs-stack)/create-donation-items">
        <Text>Go to create-donation-items</Text>
      </Link>
    </View>
  );
}
