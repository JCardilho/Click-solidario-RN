import { ReactNode, useEffect, useState } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

export interface IZoomTrigger {
  uri: string;
  children: ReactNode;
}

export const useZoom = () => {
  const [open, setOpen] = useState<{
    isOpen: boolean;
    uri: string;
  }>();
  const opacityRef = useSharedValue(0);

  useEffect(() => {
    if (open) opacityRef.value = withSpring(open.isOpen ? 1 : 0);
  }, [open]);

  const ZoomView = () => {
    return (
      open &&
      open.isOpen && (
        <>
          <Animated.View
            style={[
              {
                width: '100%',
                height: '100%',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.9)',
                padding: 16,
                zIndex: 50,
                top: 10,
                opacity: opacityRef,
              },
            ]}>
            <ImageZoom source={{ uri: open.uri }} className="w-full h-full rounded-lg border-2" />
            <Button
              classNameText="text-center"
              onPress={() => {
                opacityRef.value = withSpring(0);
                setTimeout(() => {
                  setOpen({
                    isOpen: !open.isOpen,
                    uri: open.uri,
                  });
                }, 500);
              }}
              className="absolute bottom-4 w-full">
              Fechar
            </Button>
          </Animated.View>
        </>
      )
    );
  };

  const ZoomTrigger = ({ uri, children }: IZoomTrigger) => {
    return (
      <Pressable
        onPress={() => {
          setOpen({
            isOpen: !open?.isOpen,
            uri,
          });
        }}
        className="w-full">
        {children}
      </Pressable>
    );
  };

  return {
    ZoomView,
    ZoomTrigger,
  };
};
