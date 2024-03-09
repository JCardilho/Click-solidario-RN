import { Feather, FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/Button';
import firebase from '~/utils/firebase';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import Logo from '~/assets/icon/logo.png';

export default function Donations() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { getCache, setCache } = useCacheHook();

  return (
    <ScrollView
      className="w-full p-4 flex flex-col gap-4"
      style={{
        gap: 4,
      }}>
      <SafeAreaView />
      <View className="w-full  rounded-xl flex flex-col gap-4 p-4 items-center justify-center my-4">
        <FontAwesome name="dropbox" size={50} />
        {/*  <Image source={Logo} className="w-20 h-20 rounded-full" alt="background-image" /> */}

        <Text className="text-4xl font-kanit ">Reservar doação</Text>
        <Text className="text-xl font-kanit text-center">
          Reserve a doação que um usuario disponibilizou {' :) '}
        </Text>
      </View>

      <Button
        variant="default"
        icon={{
          name: 'user',
          color: 'white',
          size: 15,
        }}
        className="mb-2">
        Minhas doações
      </Button>
      <Button
        variant="default"
        icon={{
          name: 'plus',
          color: 'white',
          size: 15,
        }}>
        Disponibilizar um item à doação
      </Button>

      <View className="h-1 w-full bg-zinc-300 rounded-lg my-4"></View>
      <Text className="text-4xl font-kanit">Itens disponibilizados:</Text>

      <View className="w-full flex flex-row gap-1 justify-around">
        <TextInput
          placeholder="Pesquisar doações"
          className="border-2 border-blue-500 p-2 rounded-lg w-[84%]"
        />
        <Button variant="default">
          <FontAwesome name="search" size={15} color="white" />
        </Button>
      </View>

      {[1, 2, 3, 4].map((item, index) => (
        <TouchableOpacity
          className="w-full border-2 border-blue-500 p-4 rounded-lg  bg-white flex flex-col gap-2 my-4"
          key={index}>
          <Text className="text-xl font-bold underline">Doação de Sofá</Text>
          <Text className="font-kanit text-lg text-justify">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit ipsam perferendis commodi
            quas deserunt quam illo laudantium voluptatem in delectus quae sequi nobis numquam sunt
            obcaecati, odio, corrupti aut tempora!
          </Text>
          <View className="h-[0.9px] w-full bg-zinc-300 rounded-lg my-2"></View>
          <View className="w-full">
            <Text className="text-md ">Proprietário da doação: Gustavo Rafael</Text>
          </View>
          <Text className="text-md font-kanit">Criado em: 11/06/2007</Text>
          <View className="h-[0.9px] w-full bg-zinc-300 rounded-lg my-2"></View>
        </TouchableOpacity>
      ))}

      <View className="my-12"></View>
    </ScrollView>
  );
}
