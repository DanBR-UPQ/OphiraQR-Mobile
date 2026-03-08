import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import NavScreen from "../screens/NavScreen";
import HomeScreen from "../screens/home/HomeScreen";
import LoginScreen from "../screens/login/LoginScreen";

import ListActivosScreen from "../screens/activos/ListActivosScreen";

import HistorialMovimientosScreen from "../screens/movimientos/HistorialMovimientosScreen";

import ScanQrScreen from "../screens/qr/ScanQrScreen";

import ListAuditoriasScreen from "../screens/reportes/ListAuditoriasScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">

        <Stack.Screen
          name="Menu"
          component={NavScreen}
          options={{ title: "Menú Principal" }}
        />

        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Home" }}
        />

        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ title: "Login" }}
        />

        <Stack.Screen
          name="ListActivosScreen"
          component={ListActivosScreen}
          options={{ title: "Lista de Activos" }}
        />

        <Stack.Screen
          name="HistorialMovimientosScreen"
          component={HistorialMovimientosScreen}
          options={{ title: "Historial de Movimientos" }}
        />

        <Stack.Screen
          name="ScanQrScreen"
          component={ScanQrScreen}
          options={{ title: "Escanear QR" }}
        />

        <Stack.Screen
          name="ListAuditoriasScreen"
          component={ListAuditoriasScreen}
          options={{ title: "Lista de Auditorías" }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}