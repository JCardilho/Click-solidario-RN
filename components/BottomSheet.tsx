import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, SvgFromUri, SvgUri } from 'react-native-svg';
import { Link } from 'expo-router';
import BottomSheet, { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { Button, IPropsButtomComponent } from './Button';

interface IProps {
  button?: IPropsButtomComponent;
  isNeedConfirm?: boolean;
  children?: React.ReactNode;
  textNeedConfirmButton?: string;
  textNeedConfirm?: string;
  descriptionNeedConfirm?: string;
  snapPoints?: string[];
}

export const useBottomSheetHook = (props?: IProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => props?.snapPoints || ['35%', '50%', "90%", "100%"], []);

  function open() {
    handlePresentModalPress();
    /* bottomSheetRef.current?.expand(); */
  }

  const close = () => {
    bottomSheetRef.current?.dismiss();
  };

  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      close();
    }
  }, []);

  const component = () => {
    return (
      <>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={0}
          enablePanDownToClose
          enableContentPanningGesture
          enableDismissOnClose
          enableOverDrag
          onChange={handleSheetChanges}
          style={{
            borderWidth: 2,
            borderColor: '#bdbdbd',
            borderRadius: 12,
          }}>
          <BottomSheetView style={styles.contentContainer}>
            {props && props.isNeedConfirm && props.button ? (
              <View className="w-full flex flex-col gap-4 p-4">
                <View className="w-full flex items-center justify-center">
                  <Text className="font-kanit text-center text-lg mb-4">
                    {props.textNeedConfirm
                      ? props.textNeedConfirm
                      : 'Você deseja confirmar essa alteração?'}
                  </Text>
                  {props.descriptionNeedConfirm && (
                    <Text className="font-kanit text-center text-sm mb-4">
                      {props.descriptionNeedConfirm}
                    </Text>
                  )}
                </View>
                <Button
                  variant={props.button.variant}
                  isLoading={props.button.isLoading}
                  icon={props.button.icon}
                  className="flex items-center justify-center"
                  onPress={() => {
                    props.button!.onPress && props.button!.onPress();
                    close();
                  }}>
                  {props.textNeedConfirmButton ? props.textNeedConfirmButton : 'Confirmar'}
                </Button>

                <View className="w-full items-center justify-center">
                  <Button
                    variant="ghost"
                    isLoading={props.button.isLoading}
                    onPress={() => {
                      close();
                    }}>
                    Cancelar
                  </Button>
                </View>
              </View>
            ) : (
              <>{props && props.children}</>
            )}
          </BottomSheetView>
        </BottomSheetModal>
      </>
    );
  };

  return {
    open,
    close,
    BottomSheet: component,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
