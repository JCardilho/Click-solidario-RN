import { Link, Stack } from 'expo-router';
import _default from 'react-hook-form/dist/utils/get';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCacheHook } from '~/utils/hooks/cacheHook';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '~/components/Button';
import { useBottomSheetHook } from '~/components/BottomSheet';

export default function Home() {
  const { BottomSheet, open } = useBottomSheetHook({
    isNeedConfirm: true,
    button: {
      variant: 'success',
    },
    textNeedConfirm: 'Você deseja confirmar essa alteração? Esse é um caminho sem volta!!',
  });

  return (
    <>
      <BottomSheet></BottomSheet>
      <View>
        <View className="w-full p-4 items-center justify-center flex">
          <Button
            onPress={() => {
              open();
              console.log('Abrir');
            }}>
            Abrir
          </Button>
        </View>
      </View>
    </>
  );
}
