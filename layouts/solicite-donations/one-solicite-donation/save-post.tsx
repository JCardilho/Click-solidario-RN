import { FontAwesome } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNotifications } from 'react-native-notificated';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Button } from '~/components/Button';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

interface IProps {
  data: ISoliciteDonation;
}

export const SavePostSoliciteDonationPage = (props: IProps) => {
  const scale = useSharedValue(1);
  const { user, setUser } = useCurrentUserHook();
  const { notify } = useNotifications();

  const { mutate: mutateSavedPost, isPending: isPendingSave } = useMutation({
    mutationKey: ['savePost'],
    mutationFn: async () => {
      if (!user || !user.uid) throw new Error('Usuario não encontrado');

      const result = await SoliciteDonationsSerivce.SaveSoliciteDonation({
        donation: props.data,
        user_uid: user?.uid,
      });
      const newPosts = [{ ...result }];
      if (user.posts_saved) newPosts.push(...user.posts_saved);

      setUser({
        ...user,
        posts_saved: newPosts,
      });
    },
    onSuccess: () => {
      notify('success', {
        params: {
          title: 'Salvo com sucesso',
        },
        config: {
          notificationPosition: 'bottom-left',
        },
      });
      scale.value = withSpring(1.1);
      setTimeout(() => {
        scale.value = withSpring(1);
      }, 100);
    },
  });

  const { mutate: mutateUnSavedPost, isPending: isPendingUnsave } = useMutation({
    mutationKey: ['unsave-post'],
    mutationFn: async () => {
      if (!user || !user.uid) throw new Error('Usuario não encontrado');

      await SoliciteDonationsSerivce.RemoveSavedSoliciteDonation({
        donation: props.data,
        user_uid: user?.uid,
      });

      const newPosts = user.posts_saved?.filter((item) => item.postId !== props.data.uid);
      setUser({
        ...user,
        posts_saved: newPosts,
      });
    },
    onSuccess: () => {
      notify('success', {
        params: {
          title: 'Removido com sucesso',
        },
        config: {
          notificationPosition: 'bottom-left',
        },
      });
      scale.value = withSpring(1.1);
      setTimeout(() => {
        scale.value = withSpring(1);
      }, 100);
    },
  });

  return (
    user && (
      <>
        <Animated.View
          style={{
            transform: [
              {
                scale: scale,
              },
            ],
            padding: 10,
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              if (user.posts_saved) {
                if (user?.posts_saved?.find((item) => item.postId === props.data.uid))
                  return mutateUnSavedPost();
                if (!user?.posts_saved?.find((item) => item.postId === props.data.uid))
                  return mutateSavedPost();
              }
              mutateSavedPost();
            }}
            disabled={isPendingSave || isPendingUnsave}
            className="w-fit  p-4">
            <Text>
              <FontAwesome
                size={24}
                color={
                  user?.posts_saved?.find((item) => item.postId === props.data.uid)
                    ? '#b3ad00'
                    : 'black'
                }
                name={
                  user?.posts_saved?.find((item) => item.postId === props.data.uid)
                    ? 'bookmark'
                    : 'bookmark-o'
                }
              />
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </>
    )
  );
};
