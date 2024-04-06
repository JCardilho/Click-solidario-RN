import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Divider } from '~/components/Divider';
import { IZoomTrigger, useZoom } from '~/components/Zoom';
import { IReserveDonation } from '~/utils/services/DTO/reserve-donation.dto';

interface IProps {
  data: IReserveDonation;
}

interface IPropsImage extends IProps {
  ZoomTrigger: ({ uri, children }: IZoomTrigger) => JSX.Element;
}

export const ViewDataTextForViewReserveDonation = ({ data }: IProps) => {
  return (
    <>
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
      <Divider />
    </>
  );
};

export const ViewDataImageForViewReserveDonation = ({ data, ZoomTrigger }: IPropsImage) => {
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
