import { FontAwesome } from '@expo/vector-icons';
import IconAwesome from '@expo/vector-icons/FontAwesome';
import { Fragment, useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

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
}

type Variants = 'default' | 'destructive' | 'primary';

export const Button = (props: IProps) => {
  const createClassnameForTouchableOpacity = (variant: Variants) => {
    const styleDefault = ` flex flex-row gap-4 items-center  p-4 rounded-lg  border-2`;
    switch (variant) {
      case 'destructive':
        return `${styleDefault} bg-red-500 border-red-300 ${props.className}`;
      case 'default':
        return `${styleDefault} bg-blue-500 border-blue-300 ${props.className}`;
      case 'primary':
        return `${styleDefault} bg-primary border-blue-600 ${props.className}`;
      default:
        return `${styleDefault} bg-blue-500 border-blue-300 ${props.className}`;
    }
  };

  return (
    <TouchableOpacity
      className={createClassnameForTouchableOpacity(props.variant)}
      onPress={props.onPress}>
      {props.icon && (
        <FontAwesome
          size={props.icon.size || 15}
          name={props.icon.name}
          color={props.icon.color || 'black'}
        />
      )}
      <Text className="text-white font-kanit">{props.children}</Text>
    </TouchableOpacity>
  );
};
