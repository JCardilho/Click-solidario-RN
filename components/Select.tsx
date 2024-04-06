import { Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface IProps {
  isError?: boolean;
  onValueChange?: (value: any, index: number) => void;
  items: {
    label: string;
    value: string;
    key: string;
  }[];
  label?: string;
  placeholder?: string;
}

export const Select = (props: IProps) => {
  return (
    <>
      ^{props.label && <Text className="font-kanit text-sm">{props.label}</Text>}
      <RNPickerSelect
        key={`select-municipality`}
        style={{
          viewContainer: {
            backgroundColor: '#eaeaea',
            borderRadius: 7,
            borderWidth: 1,
            borderColor: props.isError ? 'red' : '#023E8A',
          },
          placeholder: {
            textAlign: 'center',
            color: '#000',
            fontFamily: 'Kanit_400Regular',
          },
          done: {
            fontFamily: 'Kanit_400Regular',
          },
        }}
        onValueChange={props.onValueChange || (() => {})}
        items={props.items}
        placeholder={{
          label: props.placeholder,
          value: null,
        }}
      />
    </>
  );
};
