import { Feather, FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/Button';
import firebase from '~/utils/firebase';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import Logo from '~/assets/icon/logo.png';
import { useQuery } from '@tanstack/react-query';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';
import { addMilliseconds, format, set } from 'date-fns';
import { DefaultInformationsForReserveDonationsPage } from '~/layouts/reserve-donations/default-informations';
import { Input } from '~/components/Input';
import { Card } from '~/components/Card';
import { useFocusEffect } from '@react-navigation/native';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import { useCurrentUserHook } from './../../utils/hooks/currentUser';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { DefaultInformationsForSoliciteDonationsPage } from '~/layouts/solicite-donations/default-infromations';
import { Badge } from '~/components/Badge';
import { useZoom } from '~/components/Zoom';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Divider } from '~/components/Divider';

export default function RequestDonationsScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { getCache, setCache } = useCacheHook();
  const [search, setSearch] = useState('');
  const { user } = useCurrentUserHook();
  const [endAt, setEndAt] = useState<number>(5);
  const [endCount, setEndCount] = useState<number>(0);
  const [disableLoadMore, setDisableLoadMore] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const { ZoomTrigger, ZoomView } = useZoom();
  const WD = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [textForBottomSheetButton, setTextForBottomSheetButton] = useState<'Pesquisar' | 'Fechar'>(
    'Pesquisar'
  );

  const { data, isLoading, refetch, isRefetching } = useQuery<ISoliciteDonation[]>({
    queryKey: ['solicite-donations'],
    queryFn: async () => {
      if (!user || !user.uid) return [];

      try {
        if (search && search.length > 2) {
          const result = await SoliciteDonationsSerivce.SearchSoliciteDonations(
            search,
            user?.uid,
            0,
            1000
          );

          setDisableLoadMore(true);
          setEndCount(0);
          setEndAt(5);
          /* if (bottomSheetRef.current) bottomSheetRef.current!.expand(); */
          return result;
        }
        const result = await SoliciteDonationsSerivce.GetAllSoliciteDonations(
          user?.uid,
          0,
          endAt,
          user.state,
          user.city
        );

        if (result.length === 0) {
          const result = await SoliciteDonationsSerivce.GetAllSoliciteDonations(
            user?.uid,
            0,
            endAt + 10,
            user.state,
            user.city
          );
          if (result.length === 0) {
            setDisableLoadMore(true);
            return [];
          }
          /* if (bottomSheetRef.current) bottomSheetRef.current!.expand(); */
          return result;
        }
        /* if (bottomSheetRef.current) bottomSheetRef.current!.expand(); */
        return result;
      } catch (err) {
        console.log('err', err);
        return [];
      }
    },
  });

  useRefreshOnFocus(refetch);

  useEffect(() => {
    if (endAt && endAt != 5 && data) {
      refetch();
      if (data.length != endCount) {
        setEndCount(data.length);
      }
      if (data.length === endCount) {
        setDisableLoadMore(true);
      } else {
        setDisableLoadMore(false);
      }
    }
  }, [endAt]);

  const snapPoints = useMemo(() => ['8%', '16%', '27%'], []);
  const inputRef = useRef<TextInput>(null);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === 0) return setTextForBottomSheetButton('Pesquisar');
    setTextForBottomSheetButton('Fechar');
  }, []);

  return (
    <>
      <SafeAreaView />
      <ZoomView />

      <ScrollView
        className="w-full p-4 flex flex-col gap-4"
        style={{
          gap: 4,
        }}>
        <View className="w-full  rounded-xl flex flex-col gap-4 p-4 items-center justify-center my-4">
          <FontAwesome name="plus" size={50} />
          <Text className="text-4xl font-kanit ">Solicitar ou Doar</Text>
        </View>

        <DefaultInformationsForSoliciteDonationsPage />

        {/*  {user && !user.socialAssistant && (
          <View className="w-full flex flex-col gap-2 ">
              <Button
              icon={{
                name: 'user',
                color: 'white',
                size: 15,
              }}
              onPress={() => router.push('/(tabs-stack)/(my-donations)/solicite-donations')}>
              Minhas solicitações
            </Button>
            <Button
              icon={{
                name: 'plus',
                color: 'white',
                size: 15,
              }}
              onPress={() => router.push('/(tabs-stack)/create-solicite-donation')}>
              Solicitar doação
            </Button> *
          </View>
        )}
 */}
        {user && !user.socialAssistant && (
          <View className="w-full h-auto flex flex-row items-center justify-around ">
            <TouchableOpacity
              className="w-fit h-auto flex flex-col gap-2 items-center justify-center"
              onPress={() => router.push('/(tabs-stack)/(my-donations)/solicite-donations')}>
              <View className="w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-black bg-zinc-100">
                <FontAwesome name="user" size={30} color="#000" />
              </View>
              <Text className="text-center font-kanit text-lg w-24">Minhas solicitações</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-fit flex flex-col gap-2 items-center justify-center"
              onPress={() => router.push('/(tabs-stack)/create-solicite-donation')}>
              <View className="w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-black bg-zinc-100">
                <FontAwesome name="plus" size={30} color="#000" />
              </View>
              <Text className="text-center font-kanit text-lg w-24">Solicitar doação</Text>
            </TouchableOpacity>
          </View>
        )}

        <Divider />
        <Text className="text-2xl text-zinc-600 text-center font-kanit my-6">
          Itens solicitados:
        </Text>

        {isLoading && (
          <View className="w-full mt-4">
            <Card isLoading={true} />
          </View>
        )}

        {!isLoading &&
          data &&
          data.map((item, index) => (
            <Card
              key={`${item.uid}-solicite-donations-${index}`}
              ZoomTrigger={ZoomTrigger}
              isRenderImage
              isReduceDescription
              item={{
                createdAt: item.createdAt,
                id: item.uid,
                name: item.name,
                description:
                  item.description && item.description.length > 300
                    ? item.description.substring(0, 300) + '...'
                    : item.description,
                images: item.images as string[],
                ownerName: item.ownerName,
                city: item.city,
                state: item.state,
                ownerUid: item.ownerUid,
              }}
              href={() => {
                router.push(
                  `/(tabs-stack)/(one-solicite-donation)/(view-solicite-donation)/${item.uid}`
                );
              }}
              isVerified={item.isVerified}
            />
          ))}

        <View className="my-12"></View>
      </ScrollView>

      <BottomSheet
        snapPoints={snapPoints}
        ref={bottomSheetRef}
        style={{ backgroundColor: 'transparent', zIndex: 10000000 }}
        index={0}
        handleHeight={0}
        enableHandlePanningGesture={false}
        enableContentPanningGesture={false}
        enablePanDownToClose={false}
        handleIndicatorStyle={{ backgroundColor: 'transparent', display: 'none' }}
        backgroundComponent={(styles) => <View></View>}
        onChange={handleSheetChanges}>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            className="flex-row gap-2 bg-blue-500 rounded-3xl p-2 items-center justify-center"
            onPress={() => {
              if (textForBottomSheetButton === 'Pesquisar') {
                setTextForBottomSheetButton('Fechar');
                bottomSheetRef.current?.snapToIndex(1);
                return;
              }
              if (inputRef && inputRef.current) inputRef.current!.blur();
              bottomSheetRef.current?.snapToIndex(0);
            }}>
            <FontAwesome
              name={textForBottomSheetButton === 'Pesquisar' ? 'search' : 'close'}
              size={15}
              color={'white'}
            />
            <Text className="font-kanit text-sm text-white">{textForBottomSheetButton}</Text>
          </TouchableOpacity>
          <View className="w-full flex flex-row gap-1 items-center justify-center mt-4 ">
            {textForBottomSheetButton === 'Fechar' && (
              <>
                <Input
                  placeholder="Pesquisar"
                  style={{
                    width: WD.width - 100,
                  }}
                  reference={inputRef}
                  onChangeText={(text) => setSearch(text)}
                  value={search}
                  borderColorTailwind="border-zinc-500"
                  onPressOut={() => {
                    bottomSheetRef.current?.snapToIndex(2);
                  }}
                  onBlur={() => {
                    bottomSheetRef.current?.snapToIndex(1);
                  }}
                  className="bg-white"
                />

                <Button
                  variant="default"
                  className="h-full px-6"
                  onPress={() => {
                    if (inputRef && inputRef.current) {
                      inputRef.current!.blur();
                    }

                    bottomSheetRef.current?.snapToIndex(0);
                    refetch();
                  }}
                  isLoading={isRefetching}
                  icon={{
                    name: 'search',
                    color: 'white',
                    size: 16,
                  }}></Button>
              </>
            )}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
