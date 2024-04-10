import { Feather, FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { ReserveDonationsService } from '~/utils/services/ReserveDonationsService';
import { addMilliseconds, format, set } from 'date-fns';
import { DefaultInformationsForReserveDonationsPage } from '~/layouts/reserve-donations/default-informations';
import { Input } from '~/components/Input';
import { Card } from '~/components/Card';
import { useFocusEffect } from '@react-navigation/native';
import { useRefreshOnFocus } from '~/utils/hooks/refreshOnFocus';
import { useCurrentUserHook } from './../../utils/hooks/currentUser';
import { useZoom } from '~/components/Zoom';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Divider } from '~/components/Divider';

export default function ReserveDonations() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { getCache, setCache } = useCacheHook();
  const [search, setSearch] = useState('');
  const { user } = useCurrentUserHook();
  const [endAt, setEndAt] = useState<number>(10);
  const [endCount, setEndCount] = useState<number>(0);
  const [disableLoadMore, setDisableLoadMore] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const { ZoomView, ZoomTrigger } = useZoom();
  const WD = useWindowDimensions();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [textForBottomSheetButton, setTextForBottomSheetButton] = useState<'Pesquisar' | 'Fechar'>(
    'Pesquisar'
  );

  const { data, isLoading, refetch, isRefetching } = useQuery<{
    userReserveCount: number;
    donations: IReserveDonation[];
  }>({
    queryKey: ['reserve-donations'],
    queryFn: async () => {
      if (!user || !user.uid)
        return {
          userReserveCount: 0,
          donations: [],
        };

      try {
        if (search && search.length > 2) {
          const result = await ReserveDonationsService.SearchReserveDonations(
            search,
            user?.uid,
            0,
            1000
          );

          setDisableLoadMore(true);
          setEndCount(0);
          setEndAt(10);
          return {
            userReserveCount: result.userReserveCount,
            donations: result.donations,
          };
        }
        const result = await ReserveDonationsService.GetAllReserveDonations(
          user?.uid,
          0,
          endAt,
          user.state,
          user.city
        );

        if (result.donations.length === 0) {
          const result = await ReserveDonationsService.GetAllReserveDonations(
            user?.uid,
            0,
            endAt + 10,
            user.state,
            user.city
          );
          if (result.donations.length === 0) {
            setDisableLoadMore(true);
            return {
              userReserveCount: result.userReserveCount,
              donations: [],
            };
          }
          return {
            userReserveCount: result.userReserveCount,
            donations: result.donations,
          };
        }

        return result;
      } catch (err) {
        console.log('err', err);
        return {
          userReserveCount: 0,
          donations: [],
        };
      }
    },
  });

  useRefreshOnFocus(refetch);

  useEffect(() => {
    if (endAt && endAt != 10 && data) {
      refetch();
      if (data.donations.length != endCount) {
        setEndCount(data.donations.length);
      }
      if (data.donations.length === endCount) {
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
        ref={scrollRef}
        className="w-full p-4 flex flex-col gap-4"
        style={{
          gap: 4,
        }}>
        <View className="w-full  rounded-xl flex flex-col gap-4 p-4 items-center justify-center my-4">
          <FontAwesome name="dropbox" size={50} />
          {/*  <Image source={Logo} className="w-20 h-20 rounded-full" alt="background-image" /> */}

          <Text className="text-2xl font-kanit text-center">Reservar ou Disponibilizar doação</Text>
        </View>

        <DefaultInformationsForReserveDonationsPage />

        {/* {user && !user.socialAssistant && (
          <View className="w-full flex flex-col gap-2">
            <Button
              variant="default"
              icon={{
                name: 'user',
                color: 'white',
                size: 15,
              }}
              href={() => router.push('/(tabs-stack)/(my-donations)/reserve-donations')}>
              Meus itens disponibilizados
            </Button>

            <Button
              variant="default"
              icon={{
                name: 'plus',
                color: 'white',
                size: 15,
              }}
              href={() => router.push('/(tabs-stack)/create-reserve-donation')}>
              Disponibilizar um item à doação
            </Button>

            
          </View>
        )} */}

        {user && !user.socialAssistant && (
          <>
            <View className="w-full h-auto flex flex-row items-center justify-around ">
              <TouchableOpacity
                className="w-fit h-auto flex flex-col gap-2 items-center justify-center"
                onPress={() => router.push('/(tabs-stack)/(my-donations)/reserve-donations')}>
                <View className="w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-black bg-zinc-100">
                  <FontAwesome name="user" size={30} color="#000" />
                </View>
                <View>
                  <Text className="text-center font-kanit text-lg">Meus itens</Text>
                  <Text className="text-center font-kanit text-lg">disponibilizados</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-fit flex flex-col gap-2 items-center justify-center"
                onPress={() => router.push('/(tabs-stack)/create-reserve-donation')}>
                <View className="w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-black bg-zinc-100">
                  <FontAwesome name="plus" size={30} color="#000" />
                </View>
                <View>
                  <Text className="text-center font-kanit text-lg">Disponibilizar um item</Text>
                  <Text className="text-center font-kanit text-lg">à doação</Text>
                </View>
              </TouchableOpacity>
            </View>
            {data && data?.userReserveCount > 0 && (
              <TouchableOpacity
                className="mt-4 w-full items-center justify-center bg-red-50 shadow-2xl shadow-zinc-500 border border-red-500 rounded-lg p-4"
                onPress={() => router.push('/(tabs-stack)/my-reserves')}>
                <Text className="font-kanit text-lg">
                  Minhas reservas (Você tem {data?.userReserveCount}{' '}
                  {data.userReserveCount === 1 ? 'reserva ativa' : 'reservas ativas'} )
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <Divider />
        <Text className="text-2xl text-center font-kanit my-6 text-zinc-600">
          Itens disponibilizados:
        </Text>
        {/* 
        <View className="w-full flex flex-row gap-1 ">
          <Input
            placeholder="Pesquisar"
            style={{
              width: WD.width - 100,
            }}
            onChangeText={(text) => setSearch(text)}
            value={search}
            borderColorTailwind="border-zinc-500"
          />
          <Button
            variant="default"
            className="h-full px-6"
            onPress={() => refetch()}
            isLoading={isRefetching}
            icon={{
              name: 'search',
              color: 'white',
              size: 16,
            }}></Button>
        </View> */}

        {isLoading && (
          <View className="w-full mt-4">
            <Card isLoading={true} />
          </View>
        )}

        {!isLoading &&
          data &&
          data.donations.map((item, index) => (
            <Card
              ZoomTrigger={ZoomTrigger}
              key={`${item.uid}-reserve-donations-${index}`}
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
              hidden={{
                status: true,
              }}
              href={() =>
                router.push(
                  `/(tabs-stack)/one-reserve-donation/(view-reserve-donation)/${item.uid}`
                )
              }
            />
          ))}

        {!isLoading && data && data.donations.length !== 0 && !disableLoadMore && (
          <View className="w-full flex items-center justify-center">
            <Button
              className="mt-4"
              isLoading={isRefetching}
              icon={{
                name: 'plus',
                color: 'white',
                size: 15,
              }}
              onPress={() => {
                setEndAt(endAt + 10);
              }}>
              Carregar mais
            </Button>
          </View>
        )}

        {disableLoadMore && (
          <View className="w-full flex flex-col gap-4 items-center justify-center">
            <Text className="text-center text-red-500 my-4 font-kanit">
              Não há mais itens disponíveis para carregar
            </Text>
            <Button
              variant="ghost"
              icon={{
                name: 'arrow-up',
                color: 'black',
                size: 15,
              }}
              onPress={() => {
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}>
              Subir
            </Button>
          </View>
        )}

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
        {bottomSheetRef && bottomSheetRef.current && (
          <View style={styles.contentContainer}>
            <View className="w-full items-center justify-center">
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
            </View>
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
                      if (inputRef && inputRef.current) inputRef.current!.blur();
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
        )}
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
