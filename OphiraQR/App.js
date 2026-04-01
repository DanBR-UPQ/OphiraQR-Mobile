import AppNavigator from './navigation/AppNavigator';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0b1120',
    card: '#0b1120',
    border: '#0b1120',
    primary: '#0055e5',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}