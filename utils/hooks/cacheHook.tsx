import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCacheHook = () => {
  const setCache = async (key: string, value: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error: any) {
      console.log('Erro ao salvar usuário no AsyncStorage');
      throw new Error(error);
    }
  };

  const getCache = async (key: string): Promise<unknown> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error: any) {
      console.log('Erro ao buscar usuário no AsyncStorage');
      throw new Error(error);
    }
  };

  const DeleteCache = async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error: any) {
      console.log('Erro ao deletar usuário no AsyncStorage');
      throw new Error(error);
    }
  };

  return {
    setCache,
    getCache,
    DeleteCache,
  };
};
