import { ActivityIndicator, View } from 'react-native';

type Size = 'small' | 'large' | number;

interface IProps {
  size?: Size;
  center?: boolean;
  classNameCenter?: string;
  hiddenLoaderActive?: boolean;
  isLoader?: boolean;
}

export const Loader = (props: IProps) => {
  return !props.hiddenLoaderActive || (props.hiddenLoaderActive && props.isLoader) ? (
    <>
      {!props.center && <ActivityIndicator size="large" color={'#023E8A'} />}

      {props.center && (
        <View className={`w-full flex items-center justify-center ${props.classNameCenter}`}>
          <ActivityIndicator size="large" color={'#023E8A'} />
        </View>
      )}
    </>
  ) : (
    <></>
  );
};
