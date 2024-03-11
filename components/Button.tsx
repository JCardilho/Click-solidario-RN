import { FontAwesome } from '@expo/vector-icons';
import IconAwesome from '@expo/vector-icons/FontAwesome';
import { Fragment, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity } from 'react-native';
import Loader from '~/assets/loader/loader.svg';
import Svg, { Path, SvgFromUri, SvgUri } from 'react-native-svg';
import { Link } from 'expo-router';

interface Icon {
  name: typeof IconAwesome.defaultProps;
  color: string;
  size: number;
}

interface IProps {
  icon?: Icon;
  children: React.ReactNode;
  onPress?: () => void;
  variant: Variants;
  className?: string;
  isLoading?: boolean;
  loaderColor?: string;
  href?: () => void;
}

type Variants = 'default' | 'destructive' | 'primary';

export const Button = (props: IProps) => {
  const createClassnameForTouchableOpacity = (variant: Variants) => {
    const styleDefault = ` flex flex-row gap-4 items-center  p-4 rounded-lg  border-2`;
    switch (variant) {
      case 'destructive':
        return `${styleDefault} bg-red-500 border-red-300 ${props.isLoading ? 'opacity-50' : ''} ${props.className}`;
      case 'default':
        return `${styleDefault} bg-blue-500 border-blue-300 ${props.isLoading ? 'opacity-50' : ''} ${props.className}`;
      case 'primary':
        return `${styleDefault} bg-primary border-blue-600 ${props.isLoading ? 'opacity-50' : ''} ${props.className}`;
      default:
        return `${styleDefault} bg-blue-500 border-blue-300 ${props.isLoading ? 'opacity-50' : ''} ${props.className}`;
    }
  };

  return (
    <>
      <TouchableOpacity
        className={createClassnameForTouchableOpacity(props.variant)}
        onPress={() => {
          if (props.href) return props.href();
          if (props.isLoading) return;
          props.onPress && props.onPress();
        }}>
        {props.icon && !props.isLoading && (
          <FontAwesome
            size={props.icon.size || 15}
            name={props.icon.name}
            color={props.icon.color || 'black'}
          />
        )}
        {props.icon && props.isLoading && (
          <ActivityIndicator size="small" color={props.loaderColor ? props.loaderColor : '#fff'} />
        )}
        <Text className="text-white font-kanit">{props.children}</Text>
      </TouchableOpacity>
    </>
  );
};
