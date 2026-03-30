import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import ListActivosScreen from '../screens/activos/ListActivosScreen';
import HistorialMovimientosScreen from '../screens/movimientos/HistorialMovimientosScreen';
import ScanQrScreen from '../screens/qr/ScanQrScreen';
import ListAuditoriasScreen from '../screens/reportes/ListAuditoriasScreen';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0055e5',
        tabBarInactiveTintColor: 'white',
        tabBarStyle: {
        backgroundColor: '#0f141e',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Activos') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Movimientos') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'QR') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Reportes') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activos" component={ListActivosScreen} />
      <Tab.Screen name="Movimientos" component={HistorialMovimientosScreen} />
      <Tab.Screen name="QR" component={ScanQrScreen} />
      <Tab.Screen name="Reportes" component={ListAuditoriasScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigation;