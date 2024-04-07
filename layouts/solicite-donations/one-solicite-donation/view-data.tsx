import { FontAwesome } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Fragment, useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNotifications } from 'react-native-notificated';
import Carousel from 'react-native-reanimated-carousel';
import { Badge } from '~/components/Badge';
import { useBottomSheetHook } from '~/components/BottomSheet';
import { Divider } from '~/components/Divider';
import { SkeletonContent, SkeletorCircle } from '~/components/Skeleton';
import { IZoomTrigger } from '~/components/Zoom';
import { useCurrentUserHook } from '~/utils/hooks/currentUser';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';
import { IUser } from '~/utils/services/DTO/user.dto';
import { SoliciteDonationsSerivce } from '~/utils/services/SoliciteDonationsService';

interface IProps {
  data: ISoliciteDonation;
}

interface IPropsImage extends IProps {
  ZoomTrigger: ({ uri, children }: IZoomTrigger) => JSX.Element;
}

interface IPropsText extends IProps {
  owner?: IUser;
}

export const ViewDataTextForViewSoliciteDonation = ({ data, owner }: IPropsText) => {
  const { user } = useCurrentUserHook();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  const ownerBottomSheet = useBottomSheetHook({
    children: owner && user?.socialAssistant && (
      <>
        <View className="w-full flex p-4">
          <Text className="font-kanit text-center">Informações</Text>

          {owner && owner.image && (
            <View className="w-full flex flex-col gap-4">
              <View className="w-full items-center justify-center my-4">
                <Image
                  source={{ uri: owner?.image }}
                  className={`w-40 h-40 rounded-full ${imageLoaded ? 'block' : 'absolute'}`}
                  onLoadEnd={() => setImageLoaded(true)}
                />
              </View>

              {!imageLoaded && (
                <View className="w-full h-[120px]">
                  <SkeletonContent>
                    <SkeletorCircle r={50} cx={width / 2 - 17} cy={50} />
                  </SkeletonContent>
                </View>
              )}
            </View>
          )}

          {!owner.image && (
            <View className="w-full items-center justify-center my-4">
              <View
                className={`w-40 h-40 rounded-full bg-zinc-500 items-center justify-center border border-zinc-400`}>
                <FontAwesome name="user" size={50} />
              </View>
            </View>
          )}

          <View className="mt-4 w-full flex items-center justify-center">
            <Text className="font-kanit text-lg">Proprietário: {data.ownerName}</Text>
            <Text className="font-kanit text-lg">
              Criado em: {data.createdAt.toLocaleString('pt-BR')}
            </Text>
            <Text className="font-kanit text-lg">CPF: {owner.cpf}</Text>
            {owner.pix && owner.pix.key && owner.pix.type && (
              <Text className="font-kanit text-lg">
                CHAVE PIX: {owner.pix.key} ({owner.pix.type})
              </Text>
            )}
            <Text className="font-kanit text-lg">
              Localização: {owner.city} / {owner.state}
            </Text>
          </View>
        </View>
      </>
    ),
  });

  return (
    <>
      <ownerBottomSheet.BottomSheet />
      <Text className="font-kanit text-lg">Nome: </Text>
      <Text className="font-kanit text-lg text-justify p-2 bg-white border border-zinc-200 rounded-lg">
        {data.name}
      </Text>
      <Text className="font-kanit text-lg">Descrição: </Text>
      <Text className="font-kanit text-lg text-justify p-2 bg-white border border-zinc-200 rounded-lg">
        {data.description}
      </Text>
      <Divider />
      <Text className="font-kanit text-lg">Proprietário: {data.ownerName}</Text>
      <Text className="font-kanit text-lg">
        Criado em: {data.createdAt.toLocaleString('pt-BR')}
      </Text>
      {owner && user && user.socialAssistant && (
        <Text className="font-kanit text-lg">CPF: {owner.cpf}</Text>
      )}

      {user?.socialAssistant && (
        <TouchableOpacity onPress={ownerBottomSheet.open}>
          <Text className="font-kanit font-bold underline text-zinc-600">
            Clique para saber mais
          </Text>
        </TouchableOpacity>
      )}

      <Divider />
    </>
  );
};

export const ViewDataImageForViewSoliciteDonation = ({ data, ZoomTrigger }: IPropsImage) => {
  const WD = useWindowDimensions();
  return (
    <>
      {data.images && data.images.length > 0 && (
        <>
          <View style={{ flex: 1 }}>
            <Carousel
              mode="parallax"
              width={WD.width - 10}
              height={WD.width / 2}
              data={data.images}
              scrollAnimationDuration={1000}
              renderItem={({ index, item }) => (
                <ZoomTrigger uri={item as any}>
                  <Image
                    source={{ uri: item as any }}
                    className={`w-full h-full rounded-lg border-2`}
                    key={`${item}-${index}`}
                  />
                </ZoomTrigger>
              )}
            />
          </View>
        </>
      )}
    </>
  );
};

export const ViewDataHelpedListForViewSoliciteDonation = ({ data }: IProps) => {
  const { user } = useCurrentUserHook();
  const [selectedUser, setSelectedUser] = useState<{
    uid: string;
    name: string;
    isVerified: boolean;
  }>();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();

  const { mutate: mutateVerifiedAssistence, isPending: isPendingVerifiedAssistence } = useMutation({
    mutationKey: ['verified-helped-list'],
    mutationFn: async () => {
      if (!selectedUser) throw new Error('Usuário não selecionado');
      await SoliciteDonationsSerivce.VerifiedAssistence({
        solicite_donation_uid: data.uid,
        user_uid: selectedUser.uid,
      });
    },
    onSuccess: async () => {
      if (!selectedUser) throw new Error('Usuário não selecionado');

      await queryClient.setQueryData(
        ['solicite-donation', data.uid],
        (oldData: ISoliciteDonation) => {
          return {
            ...oldData,
            helpedList: oldData.helpedList.map((user) => {
              if (user.uid === selectedUser.uid) {
                return {
                  ...user,
                  isVerified: true,
                };
              }
              return user;
            }),
          };
        }
      );
      notify('success', {
        params: {
          title: 'Assistência confirmada com sucesso!',
        },
      });
    },
    onError: (err: any) => {
      console.log('err', err);
      notify('error', {
        params: {
          title: 'Erro ao confirmar assistência!',
        },
      });
    },
  });

  const VerifiedHelpedListBottomSheet = useBottomSheetHook({
    isNeedConfirm: true,
    textNeedConfirm: 'Você deseja confirmar que essa pessoa ajudou?',
    textNeedConfirmButton: 'Confirmar',
    descriptionNeedConfirm: `Pessoa selecionada: ${(selectedUser && selectedUser.name) || ''}`,
    button: {
      onPress: () => {
        mutateVerifiedAssistence();
      },
      isLoading: isPendingVerifiedAssistence,
    },
  });

  const { mutate: mutateUnVerifiedAssistence, isPending: isPendingUnVerifiedAssistence } =
    useMutation({
      mutationKey: ['unverified-helped-list'],
      mutationFn: async () => {
        if (!selectedUser) throw new Error('Usuário não selecionado');
        await SoliciteDonationsSerivce.UnVerifiedAssistence({
          solicite_donation_uid: data.uid,
          user_uid: selectedUser.uid,
        });
      },
      onSuccess: async () => {
        if (!selectedUser) throw new Error('Usuário não selecionado');

        await queryClient.setQueryData(
          ['solicite-donation', data.uid],
          (oldData: ISoliciteDonation) => {
            return {
              ...oldData,
              helpedList: oldData.helpedList.map((user) => {
                if (user.uid === selectedUser.uid) {
                  return {
                    ...user,
                    isVerified: false,
                  };
                }
                return user;
              }),
            };
          }
        );
        notify('success', {
          params: {
            title: 'Assistência desconfirmada com sucesso!',
          },
        });
      },
      onError: () => {
        notify('error', {
          params: {
            title: 'Erro ao desconfirmar assistência!',
          },
        });
      },
    });

  const UnVerifiedHelpedListBottomSheet = useBottomSheetHook({
    isNeedConfirm: true,
    textNeedConfirm: 'Você deseja desconfirmar que essa pessoa ajudou?',
    textNeedConfirmButton: 'Desconfirmar',
    descriptionNeedConfirm: `Pessoa selecionada: ${(selectedUser && selectedUser.name) || ''}`,
    button: {
      onPress: () => {
        mutateUnVerifiedAssistence();
      },
      isLoading: isPendingUnVerifiedAssistence,
    },
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.isVerified) VerifiedHelpedListBottomSheet.open();
    if (selectedUser && selectedUser.isVerified) UnVerifiedHelpedListBottomSheet.open();
  }, [selectedUser]);

  return (
    <>
      <VerifiedHelpedListBottomSheet.BottomSheet />
      <UnVerifiedHelpedListBottomSheet.BottomSheet />
      <Text className="font-kanit text-lg">Pessoas que ajudaram: </Text>

      <View className="p-4 bg-white border border-zinc-200 rounded-lg">
        {user?.uid === data.ownerUid && (
          <Text className="text-red-500 font-kanit text-center text-sm mb-4">
            * Clique sobre o nome de um usuário para confirmar sua assistência!!
          </Text>
        )}
        {user?.uid === data.ownerUid &&
          data.helpedList.map((user, index) => (
            <Fragment key={`helpedList-${user.uid}-${index}`}>
              <TouchableOpacity
                className={`${user.isVerified && 'bg-green-100 p-2 border border-green-500 rounded-lg'}`}
                disabled={isPendingUnVerifiedAssistence || isPendingVerifiedAssistence}
                onPress={() =>
                  setSelectedUser({
                    name: user.name,
                    uid: user.uid,
                    isVerified: user.isVerified,
                  })
                }>
                <Text key={user.uid} className="font-kanit text-md">
                  Nome: {user.name}
                </Text>
                <Text className="font-kanit text-sm">
                  Ajuda: {user.type === 'partial' ? 'Parcialmente' : 'Completamente'}
                </Text>
                {user.message && (
                  <Text className="font-kanit text-sm">Mensagem: {user.message}</Text>
                )}
                {user.isVerified && (
                  <View className="w-fit items-center justify-center my-4">
                    <Badge colorIcon="white" icon="check">
                      Confirmado pelo proprietário da doação
                    </Badge>
                  </View>
                )}
                {data.helpedList.length - 1 !== index && !user.isVerified && <Divider />}
              </TouchableOpacity>
              {data.helpedList.length - 1 !== index && user.isVerified && <Divider />}
            </Fragment>
          ))}
        {user?.uid !== data.ownerUid &&
          data.helpedList.map((user, index) => (
            <Fragment key={`helpedList-${user.uid}-${index}`}>
              <View
                className={`${user.isVerified && 'bg-green-100 p-2 border border-green-500 rounded-lg'}`}>
                <Text key={user.uid} className="font-kanit text-md">
                  Nome: {user.name}
                </Text>
                <Text className="font-kanit text-sm">
                  Ajuda: {user.type === 'partial' ? 'Parcialmente' : 'Completamente'}
                </Text>
                {user.message && (
                  <Text className="font-kanit text-sm">Mensagem: {user.message}</Text>
                )}
                {user.isVerified && (
                  <View className="w-fit items-center justify-center my-4">
                    <Badge colorIcon="white" icon="check">
                      Confirmado pelo proprietário da doação
                    </Badge>
                  </View>
                )}
                {data.helpedList.length - 1 !== index && !user.isVerified && <Divider />}
              </View>
              {data.helpedList.length - 1 !== index && user.isVerified && <Divider />}
            </Fragment>
          ))}
        {user?.uid !== data.ownerUid && data.helpedList.length === 0 && (
          <>
            <Text className="font-kanit text-lg text-center text-zinc-500 p-4">
              Essa postagem ainda não possui um ajudante registrado!!
            </Text>
          </>
        )}
      </View>
      <Divider margin="mx-4" />
    </>
  );
};
