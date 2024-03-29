import { format } from 'date-fns';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Divider } from './Divider';
import React, { ReactNode } from 'react';
import { Button } from './Button';
import { FontAwesome } from '@expo/vector-icons';

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
  item: IItem;
  children?: ReactNode;
  hidden?: IHidden;
  href?: () => void;
  status?: React.ReactNode;
}

export const Card = (props: IProps) => {
  return (
    <>
      <View className="w-full border border-blue-500 p-4 rounded-lg  bg-white flex flex-col gap-2 my-4 shadow-xl shadow-zinc-800">
        {props.item.images && props.item.images.length > 0 && (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
            {props.item.images.map((image: any) => (
              <Image
                source={{ uri: image }}
                className="w-[150px] h-[150px] rounded-lg border-2 border-primary m-2"
                key={image}
              />
            ))}
          </ScrollView>
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

        {!props.hidden?.status && (
          <>
            <Text className="text-md font-kanit">Status:</Text>
            <View className="w-full flex items-center flex-row gap-2">{props.status}</View>
            <Divider />
          </>
        )}
        <Button
          variant="default"
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
    </>
  );
};
