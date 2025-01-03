import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./components/LoginScreen";
import SignUpScreen from "./components/SignUpScreen";
import DashboardScreen from "./components/Dashboard";
import TrackActivityScreen from "./components/TrackActivityScreen";
import AdventuresScreen from "./components/AdventuresScreen";
import SavedSpotsScreen from "./components/SavedSpotsScreen";
import AchievementsScreen from "./components/AchievementsScreen";
import AddSpotScreen from "./components/AddSpotScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TrackActivityScreen"
            component={TrackActivityScreen}
          />
          <Stack.Screen name="AdventuresScreen" component={AdventuresScreen} />
          <Stack.Screen name="SavedSpotsScreen" component={SavedSpotsScreen} />
          <Stack.Screen name="AddSpotScreen" component={AddSpotScreen} />
          <Stack.Screen
            name="AchievementsScreen"
            component={AchievementsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
