import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import ListActivosScreen from '../screens/activos/ListActivosScreen';
import HistorialMovimientosScreen from '../screens/movimientos/HistorialMovimientosScreen';
import ScanQrScreen from '../screens/qr/ScanQrScreen';
import ListAuditoriasScreen from '../screens/reportes/ListAuditoriasScreen';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator>

      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Activos" component={ListActivosScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Movimientos" component={HistorialMovimientosScreen} options={{ headerShown: false }} />
      <Tab.Screen name="QR" component={ScanQrScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Reportes" component={ListAuditoriasScreen} options={{ headerShown: false }} />

    </Tab.Navigator>
  );
};

export default TabNavigation;