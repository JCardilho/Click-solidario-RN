import { format } from 'date-fns';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Divider } from './Divider';
import React, { Fragment, ReactNode } from 'react';
import { Button } from './Button';
import { FontAwesome } from '@expo/vector-icons';
import { Badge } from './Badge';
import { Skeleton, SkeletonContent, SkeletonRect } from './Skeleton';
import Carousel from 'react-native-reanimated-carousel';

interface IItem {
  id: string;
  name: string;
  description?: string;
  ownerName?: string;
  createdAt: string | Date;
  images?: string[] | null;
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
}

export const Card = (props: IProps) => {
  const borderContainer = props.isFinished ? 'border-green-500' : 'border-blue-500';
  const borderImage = props.isFinished ? 'border-green-500' : 'border-primary';
  const WD = useWindowDimensions();

  return (
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
          className={`w-full border p-4 rounded-lg  bg-white flex flex-col gap-2 my-4 shadow-xl shadow-zinc-800 ${borderContainer}`}>
          {props.item.images && props.item.images.length > 0 && (
            <>
              <View style={{ flex: 1 }}>
                <Carousel
                  mode="parallax"
                  width={WD.width - 50}
                  height={WD.width / 2}
                  
                  data={props!.item!.images!}
                  scrollAnimationDuration={1000}
                  renderItem={({ index, item }) => (
                    <Image
                      source={{ uri: item }}
                      className={`w-full h-full rounded-lg border-2 ${borderImage}`}
                      key={item + index}
                    />
                  )}
                />
              </View>
            </>
          )}

          <Text className="text-xl font-bold underline">{props.item.name}</Text>
          <Text className="font-kanit text-lg text-justify">{props.item.description}</Text>
          <View className="h-[0.9px] w-full bg-zinc-300 rounded-lg my-2"></View>
          {!props.hidden?.ownerName && (
            <View className="w-full">
              <Text className="text-md font-kanit">
                Proprietário da doação: {props.item.ownerName}
              </Text>
            </View>
          )}
          <Text className="text-md font-kanit">
            Criado em: {format(new Date(props.item.createdAt), 'dd-MM-yyyy HH:mm')}
          </Text>
          <Divider />

          {(!props.hidden?.status || props.isFinished) && (
            <>
              <Text className="text-md font-kanit">Status:</Text>
              <View className="w-full flex items-center flex-row gap-2">
                {props.status}
                {props.isFinished && (
                  <Badge icon="hourglass-3" colorIcon="white">
                    Finalizado!!
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
  );
};
