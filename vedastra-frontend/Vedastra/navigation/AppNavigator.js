import React, { useContext, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext, AuthProvider } from "../contexts/AuthContext"; // Import the AuthContext and AuthProvider

import OnboardingScreen from "../screens/OnboardingScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

import UserLoginScreen from "../screens/User/UserLoginScreen";
import UserRegisterScreen from "../screens/User/UserRegistrationScreen";
import UserHomeScreen from "../screens/User/UserHomeScreen";
import BookingScreen from "../screens/User/BookingScreen";
import ConsultationStatusScreen from "../screens/User/ConsultationStatusScreen";

import AstrologerLoginScreen from "../screens/Astrologer/AstrologerLoginScreen";
import AstrologerRegisterScreen from "../screens/Astrologer/AstrologerRegistrationScreen";
import AstrologerHomeScreen from "../screens/Astrologer/AstrologerHomeScreen";
import AstrologerConsultationScreen from "../screens/Astrologer/AstrologerConsultationScreen";

import ChatScreen from "../screens/ChatScreen";
import ChatProfileScreen from "../screens/ChatProfileScreen";

const Stack = createStackNavigator();

const UserStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="UserLogin">
      <Stack.Screen
        name="UserLogin"
        component={UserLoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserRegister"
        component={UserRegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Forgot"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="UserHome" component={UserHomeScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConsultationStatus"
        component={ConsultationStatusScreen}
      />
      <Stack.Screen
        name="ChatProfile"
        component={ChatProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AstrologerStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="AstrologerLogin">
      <Stack.Screen
        name="AstrologerLogin"
        component={AstrologerLoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AstrologerRegister"
        component={AstrologerRegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Forgot"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AstrologerHome" component={AstrologerHomeScreen} />
      <Stack.Screen
        name="UpcomingConsultations"
        component={AstrologerConsultationScreen}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatProfile"
        component={ChatProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { userRole } = useContext(AuthContext); // Access user role from context

  const getInitialRoute = () => {
    if (userRole === "user") return "UserStack";
    if (userRole === "astrologer") return "AstrologerStack";
    return "Onboarding";
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={getInitialRoute()}>
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
