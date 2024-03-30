import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Divider } from '~/components/Divider';
import { ISoliciteDonation } from '~/utils/services/DTO/solicite-donation.dto';

interface IProps {
  data: ISoliciteDonation;
}

export const ViewDataTextForViewSoliciteDonation = ({ data }: IProps) => {
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

export const ViewDataImageForViewSoliciteDonation = ({ data }: IProps) => {
  return (
    <>
      {data.images && data.images.length > 0 && (
        <>
          <Text className="font-kanit">Imagens: </Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
            {data.images.map((image: any, index) => (
              <TouchableOpacity key={image + Math.random() * 100 + index}>
                <Image
                  source={{ uri: image }}
                  className="w-[250px] h-[250px] rounded-lg border-2 border-primary m-2"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </>
  );
};
