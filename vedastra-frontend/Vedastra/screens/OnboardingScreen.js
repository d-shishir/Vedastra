import React, { useContext } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { Button } from "react-native-elements";
import { AuthContext } from "../contexts/AuthContext"; // Import the AuthContext

const OnboardingScreen = ({ navigation }) => {
  const { setRole } = useContext(AuthContext); // Use the context to set role

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1516571748831-5d81767b788d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Replace with your image URL

  // Function to handle role selection and navigation
  const handleRoleSelection = async (role) => {
    await setRole(role);
    navigation.navigate(role === "user" ? "UserStack" : "AstrologerStack");
  };

  return (
    <ImageBackground
      source={{ uri: backgroundImageUrl }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Welcome to Vedastra!</Text>
        <Text style={styles.subHeader}>Select Your Role</Text>

        <Button
          title="I am a User"
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={() => handleRoleSelection("user")}
        />
        <Button
          title="I am an Astrologer"
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          onPress={() => handleRoleSelection("astrologer")}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent white background
    borderRadius: 10,
    padding: 20,
    elevation: 5, // For shadow on Android
    shadowColor: "#000", // Shadow color on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 10,
  },
});

export default OnboardingScreen;
