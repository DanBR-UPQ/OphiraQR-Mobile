import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigation from "./TabNavigation";
import LoginScreen from "../screens/login/LoginScreen";
import CrearAuditoriaScreen from "../screens/reportes/CrearAuditoriasScreen";
import PerfilScreen from "../screens/perfil/PerfilScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={TabNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CrearAuditoria"
        component={CrearAuditoriaScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}