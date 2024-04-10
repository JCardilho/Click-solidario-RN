import { format } from 'date-fns';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Divider } from './Divider';
import React, { Fragment, ReactNode } from 'react';
import { Button } from './Button';
import { FontAwesome } from '@expo/vector-icons';
import { Badge } from './Badge';
import { Skeleton, SkeletonContent, SkeletonRect, SkeletorCircle } from './Skeleton';
import Carousel from 'react-native-reanimated-carousel';
import { IZoomTrigger } from './Zoom';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

interface IItem {
  id: string;
  name: string;
  description?: string;
  ownerName?: string;
  createdAt: string | Date;
  images?: string[] | null;
  state?: string;
  city?: string;
  type?: 'solicite' | 'reserve';
  ownerUid?: string;
}

interface IHidden {
  ownerName?: boolean;
  status?: boolean;
}

interface IProps {
  item?: IItem;
  children?: ReactNode;
  hidden?: IHidden;
  href?: () => void;
  status?: React.ReactNode;
  isFinished?: boolean;
  isLoading?: boolean;
  isVerified?: boolean;
  isRenderImage?: boolean;
  isReduceDescription?: boolean;
  ZoomTrigger?: ({ uri, children }: IZoomTrigger) => JSX.Element;
}

export const Card = (props: IProps) => {
  const borderContainer = props.isFinished ? 'border-green-500' : 'border-transparent';
  const borderImage = props.isFinished ? 'border-green-500' : 'border-transparent';
  const WD = useWindowDimensions();
  const { user } = useCurrentUserHook();
  const queryClient = useQueryClient();

  const { data: userImage, isLoading } = useQuery<string>({
    queryKey: ['get-image', props.isRenderImage ? props.item?.ownerUid : props.item?.ownerName],
    queryFn: async () => {
      if (!props.isRenderImage) return '';
      const verifyIfHasImage: string | undefined = await queryClient.getQueryData([
        'get-image',
        props.item?.ownerUid,
      ]);
      if (verifyIfHasImage) return verifyIfHasImage || '';
      const storage = getStorage();
      const mountainsRef = ref(
        storage,
        `images/users/${props.item?.ownerUid}/${props.item?.ownerUid}`
      );
      console.log('procurando', `images/users/${props.item?.ownerUid}/${props.item?.ownerUid}`);
      const result = await getDownloadURL(mountainsRef)
        .then(async (url) => {
          queryClient.setQueryData(['get-image', props.item?.ownerUid], url);
          console.log('url', url);
          return url;
        })
        .catch((err) => {
          console.log('err', err);
          return '';
        });
      return result;
    },
  });

  return (
    user && (
      <>
        {props.isLoading && (
          <View
            className="w-full"
            style={{
              height: WD.height,
            }}>
            <SkeletonContent>
              <SkeletonRect height={500} y={0 * 510} />
              <SkeletonRect height={500} y={1 * 510} />
              <SkeletonRect height={500} y={2 * 510} />
              <SkeletonRect height={500} y={3 * 510} />
            </SkeletonContent>
          </View>
        )}

        {!props.isLoading && props.item && (
          <View
            className={`w-full border p-4 rounded-lg  bg-white flex flex-col gap-2 my-4 shadow-2xl shadow-zinc-800 ${borderContainer}`}>
            {props.item.images && props.item.images.length > 0 && (
              <>
                <View className="flex flex-row items-center gap-4 mt-4">
                  {isLoading && (
                    <View className="w-14 h-14">
                      <SkeletonContent>
                        <SkeletorCircle cx={20} cy={20} r={20} />
                      </SkeletonContent>
                    </View>
                  )}
                  {userImage &&
                    (props.ZoomTrigger ? (
                      <props.ZoomTrigger uri={userImage}>
                        <Image
                          source={{ uri: userImage || '' }}
                          className="w-14 h-14 rounded-full"
                        />
                      </props.ZoomTrigger>
                    ) : (
                      <Image source={{ uri: userImage || '' }} className="w-14 h-14 rounded-full" />
                    ))}
                  {!userImage && !isLoading && (
                    <View className="w-14 h-14 rounded-full bg-zinc-200 flex items-center justify-center">
                      <FontAwesome name="user" size={20} color={'#5e5e5e'} />
                    </View>
                  )}

                  <View className="flex flex-col">
                    <Text className="font-kanit text-lg">{props.item.ownerName}</Text>
                    {/* <Badge
                      colorIcon="#1c1c1c"
                      icon="hourglass-o"
                      color="bg-zinc-200"
                      classNameText="text-zinc-800">
                     
                    </Badge> */}
                    <Text className="font-kanit text-md text-zinc-600">
                      {format(new Date(props.item.createdAt), 'dd/MM/yyyy')}
                    </Text>
                  </View>
                </View>

                {(props.item.type || props.item.city || props.item.state) && (
                  <View className="flex items-center justify-center flex-row gap-1 flex-wrap pt-2">
                    {props.item.type && (
                      <View className="items-start justify-start">
                        <Badge
                          colorIcon="#1c1c1c"
                          icon={props.item.type === 'solicite' ? 'dropbox' : 'handshake-o'}
                          color="bg-zinc-200"
                          classNameText="text-zinc-800">
                          {props.item.type === 'solicite' ? 'Solicitação' : 'Reserva'}
                        </Badge>
                      </View>
                    )}

                    {props.item.city && props.item.state && (
                      <View className="items-start justify-start">
                        <Badge
                          colorIcon="#1c1c1c"
                          icon="map-marker"
                          color="bg-zinc-200"
                          classNameText="text-zinc-800">
                          {props.item.city} - {props.item.state}
                        </Badge>
                      </View>
                    )}

                    {/*  {props.item.createdAt && (
                      <View className="items-start justify-start">
                       
                      </View>
                    )} */}
                  </View>
                )}

                <View style={{ flex: 1, elevation: 5 }}>
                  <Carousel
                    mode="parallax"
                    width={WD.width - 50}
                    height={WD.width / 2}
                    data={props!.item!.images!}
                    scrollAnimationDuration={1000}
                    renderItem={({ index, item }) =>
                      props.ZoomTrigger ? (
                        <props.ZoomTrigger uri={item}>
                          <Image
                            source={{ uri: item }}
                            className={`w-full h-full rounded-lg border-2 ${borderImage}`}
                            key={item + index}
                          />
                        </props.ZoomTrigger>
                      ) : (
                        <Image
                          source={{ uri: item }}
                          className={`w-full h-full rounded-lg border-2 ${borderImage}`}
                          key={item + index}
                        />
                      )
                    }
                  />
                </View>
              </>
            )}

            <Text className="text-xl font-bold underline">{props.item.name}</Text>
            <Text className="font-kanit text-lg text-justify">
              {props.item.description
                ? props.isReduceDescription
                  ? props.item.description.length > 100
                    ? `${props.item.description.substring(0, 100)}...`
                    : props.item.description
                  : props.item.description
                : ''}
            </Text>
            <View className="h-[0.9px] w-full bg-zinc-300 rounded-lg my-2"></View>

            {((!props.hidden?.status && props.status) || props.isFinished || props.isVerified) && (
              <>
                {!props.hidden && props.status && (
                  <Text className="text-md font-kanit">Status:</Text>
                )}
                <View
                  className={`w-full flex items-center flex-row gap-2 ${!props.hidden?.status && !props.status ? 'justify-center' : ''}`}>
                  {props.status}
                  {props.isFinished && (
                    <Badge icon="hourglass-3" colorIcon="white">
                      Finalizado!!
                    </Badge>
                  )}
                  {props.isVerified && (
                    <Badge icon="handshake-o" colorIcon="white">
                      Verificado pela assistente social
                    </Badge>
                  )}
                </View>
                <Divider />
              </>
            )}
            <Button
              variant={props.isFinished ? 'success' : 'default'}
              icon={{
                name: 'info',
                color: 'white',
                size: 15,
              }}
              href={props.href}>
              Saber mais
            </Button>
            {props.children}
          </View>
        )}
      </>
    )
  );
};
