//https://app.slack.com/client/T03BTUXEC2F/dms
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./src/components/Home";
import SingleAction from "./src/components/SingleAction";
import History from "./src/components/History"; // Import History screen
import BulkAction from "./src/components/BulkAction"; // Import History screen

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SingleAction" component={SingleAction} />
        <Stack.Screen name="History" component={History} /> 
        <Stack.Screen name="BulkAction" component={BulkAction} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}


