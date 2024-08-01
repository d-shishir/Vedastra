import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import OnboardingScreen from "../screens/OnboardingScreen";
import UserLoginScreen from "../screens/User/UserLoginScreen";
import UserRegisterScreen from "../screens/User/UserRegistrationScreen";
import UserHomeScreen from "../screens/User/UserHomeScreen";
import BookingScreen from "../screens/User/BookingScreen";

import AstrologerLoginScreen from "../screens/Astrologer/AstrologerLoginScreen";
import AstrologerRegisterScreen from "../screens/Astrologer/AstrologerRegistrationScreen";
import AstrologerHomeScreen from "../screens/Astrologer/AstrologerHomeScreen";
import ManageAvailabilityScreen from "../screens/Astrologer/ManageAvailabilityScreen";

const Stack = createStackNavigator();

const UserStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="UserLogin" component={UserLoginScreen} />
      <Stack.Screen name="UserRegister" component={UserRegisterScreen} />
      <Stack.Screen name="UserHome" component={UserHomeScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
    </Stack.Navigator>
  );
};

const AstrologerStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="AstrologerLogin" component={AstrologerLoginScreen} />
      <Stack.Screen
        name="AstrologerRegister"
        component={AstrologerRegisterScreen}
      />
      <Stack.Screen name="AstrologerHome" component={AstrologerHomeScreen} />
      <Stack.Screen
        name="ManageAvailability"
        component={ManageAvailabilityScreen}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserStack"
          component={UserStackNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AstrologerStack"
          component={AstrologerStackNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;