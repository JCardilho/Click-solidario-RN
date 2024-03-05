import { Stack, Link } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getDatabase } from 'firebase/database';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function Page() {
  const [exibir, setExibir] = useState(false);


  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: 'Overview' }} />
      <View className={styles.main}>
        <View className="w-auto flex flex-col gap-4">
          <View>
            <Text className="text-lg">Digite seu email:</Text>
            <TextInput
              placeholder="Email"
              className="text-lg border-2 border-blue-500 p-2 rounded-lg placeholder:text-2xl placeholder:text-black"
            />
          </View>
          <View>
            <Text className="text-lg">Digite seu senha:</Text>
            <TextInput
              placeholder="Senha"
              className="text-lg border-2 border-blue-500 p-2 rounded-lg placeholder:text-2xl placeholder:text-black"
            />
          </View>

          <TouchableOpacity className="w-full bg-blue-500 p-2  rounded-lg ">
            <Text className="text-center text-white text-2xl">Entrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full bg-blue-500 p-2  rounded-lg "
            onPress={() => setExibir(!exibir)}>
            <Text className="text-center text-white text-2xl">Teste</Text>
          </TouchableOpacity>
          <Link href={'/registrar'} className="w-full  p-2  rounded-lg ">
            <Text className="text-center  text-2xl">Registrar</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = {
  button: 'items-center bg-indigo-500 rounded-[28px] shadow-md p-4',
  buttonText: 'text-white text-lg font-semibold text-center',
  container: 'flex-1 p-6',
  main: 'flex-1 max-w-[960] justify-between',
  title: 'text-[64px] font-bold',
  subtitle: 'text-4xl text-gray-700',
};
