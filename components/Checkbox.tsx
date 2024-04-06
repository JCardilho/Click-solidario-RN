import BouncyCheckbox from 'react-native-bouncy-checkbox';

interface IProps {
  onPress: (value: boolean) => void;
  placeholder?: string;
}

export const Checkbox = (props: IProps) => {
  return (
    <BouncyCheckbox
      className="text-lg p-5 rounded-lg border border-primary font-kanit"
      text={props.placeholder}
      unfillColor="#ffffff"
      fillColor="#023E8A"
      iconStyle={{ borderColor: 'blue' }}
      innerIconStyle={{ borderColor: 'blue' }}
      onPress={(isChecked: boolean) => props.onPress(isChecked)}
      textStyle={{ fontFamily: 'Kanit_400Regular' }}
    />
  );
};
