import { useFonts as useFontKanit } from '@expo-google-fonts/kanit';
import { useFonts as useFontMontserrat } from '@expo-google-fonts/montserrat';
import { Kanit_400Regular } from './../../node_modules/@expo-google-fonts/kanit/index';
import { Montserrat_400Regular } from './../../node_modules/@expo-google-fonts/montserrat/index';

export const FontsLoadProvider = ({ children }: { children: React.ReactNode }) => {
  let [fontsLoadedKanit, fontErrorKanit] = useFontKanit({
    Kanit_400Regular,
  });

  let [fontsLoadedMontserrat, fontErrorMontserrat] = useFontMontserrat({
    Montserrat_400Regular,
  });

  if ((!fontsLoadedKanit && !fontErrorKanit) || (!fontsLoadedMontserrat && !fontErrorMontserrat)) {
    return null;
  }

  return children;
};
