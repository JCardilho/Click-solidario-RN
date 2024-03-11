import { View } from 'react-native';

interface IProps {
  color?: string;
  margin?: string;
  size?: string;
}

export const Divider = (props: IProps) => {
  return (
    <View
      className={`
         w-full rounded-lg 
        ${props.margin ? props.margin : 'my-4'} 
        ${props.color ? props.color : 'bg-zinc-300'}
        ${props.size ? props.size : 'h-[0.90px]'}
        `}
    />
  );
};
