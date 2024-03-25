import { FontAwesome } from '@expo/vector-icons';
import IconAwesome from '@expo/vector-icons/FontAwesome';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Loader from '~/assets/loader/loader.svg';

export interface IconButtonComponent {
  name: keyof typeof IconAwesome.glyphMap;
  color: string;
  size: number;
}

export interface IPropsButtomComponent {
  icon?: IconButtonComponent;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: VariantsButtonComponent;
  className?: string;
  isLoading?: boolean;
  loaderColor?: string;
  href?: () => void;
  borderVariant?: string;
  classNameText?: string;
  disabled?: boolean;
}

export type VariantsButtonComponent =
  | 'default'
  | 'destructive'
  | 'primary'
  | 'ghost'
  | 'success'
  | 'borded';

export const Button = (props: IPropsButtomComponent) => {
  const createClassnameForTouchableOpacity = (variant?: VariantsButtonComponent) => {
    const styleDefault = ` flex flex-row gap-4 items-center  p-4 rounded-lg  border-2`;
    switch (variant) {
      case 'destructive':
        return `${styleDefault} bg-red-500 border-red-300 ${disabledClass} ${props.className}`;
      case 'default':
        return `${styleDefault} bg-blue-500 border-blue-300 ${disabledClass} ${props.className}`;
      case 'primary':
        return `${styleDefault} bg-primary border-blue-600 ${disabledClass} ${props.className}`;
      case 'ghost':
        return `${styleDefault} bg-transparent border-transparent ${disabledClass} ${props.className}`;
      case 'success':
        return `${styleDefault} bg-green-500 border-green-400 ${disabledClass} ${props.className}`;
      case 'borded':
        return `${styleDefault} bg-transparent ${props.borderVariant ? props.borderVariant : 'border-zinc-500'} ${disabledClass} ${props.className}`;
      default:
        return `${styleDefault} bg-blue-500 border-blue-300 ${disabledClass} ${props.className}`;
    }
  };

  const disabledClass = props.disabled || props.isLoading ? 'opacity-50' : '';

  return (
    <>
      <TouchableOpacity
        className={createClassnameForTouchableOpacity(props.variant)}
        disabled={props.disabled}
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
        {props.children && (
          <Text
            className={`
          font-kanit ${props.variant == 'ghost' || props.variant == 'borded' ? 'text-black' : 'text-white'} ${props.classNameText}
        `}>
            {props.children}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
};
