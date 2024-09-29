import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../contexts/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";

// Import screens
import OnboardingScreen from "../screens/OnboardingScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

// User screens
import UserLoginScreen from "../screens/User/UserLoginScreen";
import UserRegisterScreen from "../screens/User/UserRegistrationScreen";
import UserHomeScreen from "../screens/User/UserHomeScreen";
import ConsultationStatusScreen from "../screens/User/ConsultationStatusScreen";
import AstrologerDetailScreen from "../screens/AstrologerDetailScreen";

// Astrologer screens
import AstrologerLoginScreen from "../screens/Astrologer/AstrologerLoginScreen";
import AstrologerRegisterScreen from "../screens/Astrologer/AstrologerRegistrationScreen";
import AstrologerHomeScreen from "../screens/Astrologer/AstrologerHomeScreen";
import AstrologerConsultationScreen from "../screens/Astrologer/AstrologerConsultationScreen";

// Commons screens
import ChatScreen from "../screens/ChatScreen";
import ChatProfileScreen from "../screens/ChatProfileScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../utils/colors";

// Create stack and tab navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Consultations") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarHideOnKeyboard: true,
      })}
      tabBarOptions={{
        activeTintColor: colors.accent,
        inactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Home"
        component={UserHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Consultations"
        component={ConsultationStatusScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarVisible: false,
        }}
      />
      <Tab.Screen
        name="ChatProfile"
        component={ChatProfileScreen}
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarVisible: false,
        }}
      />
      <Tab.Screen
        name="AstroDetail"
        component={AstrologerDetailScreen}
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarVisible: false,
        }}
      />
    </Tab.Navigator>
  );
};

const AstrologerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Consultations") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarHideOnKeyboard: true,
      })}
      tabBarOptions={{
        activeTintColor: colors.accent,
        inactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Home"
        component={AstrologerHomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Consultations"
        component={AstrologerConsultationScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarVisible: false,
        }}
      />
      <Tab.Screen
        name="ChatProfile"
        component={ChatProfileScreen}
        options={{
          headerShown: false,
          tabBarButton: () => null,
          tabBarVisible: false,
        }}
      />
    </Tab.Navigator>
  );
};

const UserStackNavigator = () => {
  return (
    <Stack.Navigator>
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
      <Stack.Screen
        name="UserTabs"
        component={UserTabNavigator}
        options={{ headerShown: false }}
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

const AstrologerStackNavigator = () => {
  return (
    <Stack.Navigator>
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
      <Stack.Screen
        name="AstrologerTabs"
        component={AstrologerTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { userRole } = useContext(AuthContext);

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
