import { Text, TextInput, TextInputAndroidProps, TextInputProps, View } from 'react-native';

interface IProps {
  isTextArea?: boolean;
  placeholder: string;
  label?: string;
  error?: string;
  isDisabled?: boolean;
  onChangeText?: (text: string) => void;
  message?: string;
  className?: string;
  value?: string;
  style?: any;
  borderColorTailwind?: string;
  reference?: any;
  isPassword?: boolean;
}

export const Input = (props: IProps & TextInputAndroidProps & TextInputProps) => {
  return (
    <View className={`w-auto flex flex-col ${props.className}`}>
      {props.label && <Text className="text-md font-kanit">{props.label}</Text>}
      <TextInput
        {...props}
        secureTextEntry={props.isPassword ? true : false}
        value={props.value}
        placeholder={props.placeholder}
        style={props.style}
        ref={props.reference}
        className={`
    border rounded-lg p-4 font-kanit
    ${props.error ? 'border-red-500' : props.borderColorTailwind ? props.borderColorTailwind : 'border-primary'}
        `}
        onChangeText={props.onChangeText}
        multiline={props.isTextArea}
        editable={!props.isDisabled}
      />
      {props.error && (
        <Text className="text-md font-kanit text-red-500 ml-1">
          {'* '}
          {props.error}
        </Text>
      )}
      {props.message && (
        <Text className="text-md font-kanit ml-1">
          {'* '}
          {props.message}
        </Text>
      )}
    </View>
  );
};
