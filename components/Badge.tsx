import { FontAwesome } from '@expo/vector-icons';
import { Text } from 'react-native';
import { View } from 'react-native';
import TypeFontAwesome from '@expo/vector-icons/FontAwesome';

interface IProps {
  icon?: keyof typeof TypeFontAwesome.glyphMap;
  color?: string;
  colorIcon?: string;
  children: React.ReactNode;
}

export const Badge = (props: IProps) => {
  return (
    <>
      <View
        className={`
        rounded-[50px] w-fit flex flex-row gap-4 px-4 py-1 items-center justify-center ${props.color ? props.color : 'bg-green-500'}
      `}>
        <FontAwesome name={props.icon} color={props.colorIcon} size={10}></FontAwesome>
        <Text className="text-white font-kanit">{props.children}</Text>
      </View>
    </>
  );
};
