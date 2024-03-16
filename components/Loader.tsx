import { ActivityIndicator, View } from 'react-native';
import { create } from 'zustand';

type Size = 'small' | 'large' | number;

interface IProps {
  size?: Size;
  center?: boolean;
  classNameCenter?: string;
  hiddenLoaderActive?: boolean;
  isLoader?: boolean;
  fullscreen?: boolean;
  activeHook?: boolean;
}

interface Types {
  isLoading: boolean;
}

interface Actions {
  setIsLoading: (isLoading: boolean) => void;
}

export const useLoader = create<Types & Actions>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

export const useLoaderHook = () => {
  const { setIsLoading, isLoading: isLoadingComponent } = useLoader();

  const startLoadingForUseMutation = {
    onMutate: () => {
      setIsLoading(true);
    },
  };

  const stopLoadingForReactQueryError = {
    onError: (err: any) => {
      console.log(err)
      setIsLoading(false);
    },
  };

  const stopLoadingForReactQuerySuccess = {
    onSuccess: () => {
      setIsLoading(false);
    },
  };

  const startLoadingForUseQuery = {
    onSettled: () => {
      setIsLoading(true);
    },
  };

  const stopLoadingForUseQuery = {
    onSettled: () => {
      setIsLoading(false);
    },
  };

  return {
    mutation: {
      startLoadingForUseMutation,
    },
    query: {
      startLoadingForUseQuery,
      stopLoadingForUseQuery,
    },
    setIsLoading,
    isLoadingComponent,
    stopLoadingForReactQueryError,
    stopLoadingForReactQuerySuccess,
  };
};

export const Loader = (props: IProps) => {
  const { isLoading } = useLoader();

  return !props.hiddenLoaderActive ||
    (props.hiddenLoaderActive && props.isLoader) ||
    (props.activeHook && isLoading) ? (
    <>
      {!props.center && !props.fullscreen && <ActivityIndicator size="large" color={'#023E8A'} />}

      {props.center && !props.fullscreen && (
        <View className={`w-full flex items-center justify-center ${props.classNameCenter}`}>
          <ActivityIndicator size="large" color={'#023E8A'} />
        </View>
      )}

      {props.fullscreen && !props.center && isLoading && (
        <View className="absolute z-50 w-screen h-screen bg-black/20 bg-opacity-50 flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={'#023E8A'} />
        </View>
      )}
    </>
  ) : (
    <></>
  );
};
