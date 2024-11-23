import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import TabLayout from "./tabs/_layout"; 

type AppStackParamList = {
  Login: undefined;
  RegisterScreen: undefined;
  TabLayout: undefined; 
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Conditionally render screens based on login state */}
        {isLoggedIn ? (
          <Stack.Screen name="TabLayout" component={TabLayout} />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              children={(props) => (
                <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
              )}
            />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
