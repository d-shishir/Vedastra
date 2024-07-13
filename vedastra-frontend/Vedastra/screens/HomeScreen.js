import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for token storage

const HomeScreen = ({ navigation }) => {
  // Logout function
  const handleLogout = async () => {
    try {
      // Clear authentication token from AsyncStorage or secure storage
      await AsyncStorage.removeItem("token");
      navigation.navigate("Login"); // Navigate back to Login screen
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Home Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;
