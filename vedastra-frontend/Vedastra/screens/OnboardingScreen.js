import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext"; // Import the AuthContext
import { colors } from "../utils/colors";

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
        <View style={styles.headerContainer}>
          <Image
            source={require("../assets/vedastra.png")}
            style={{ width: 70, height: 70 }}
          />
          <Text style={styles.header}>Welcome to</Text>
          <Text style={styles.header}>Vedastra!</Text>
        </View>
        <Text style={styles.subHeader}>Select Your Role</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRoleSelection("user")}
        >
          <Text style={styles.buttonText}>I am a User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRoleSelection("astrologer")}
        >
          <Text style={styles.buttonText}>I am an Astrologer</Text>
        </TouchableOpacity>
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
    shadowColor: colors.primary, // Shadow color on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Roboto-Bold", // Ensure you have the appropriate font imported
    color: colors.primary,
    marginTop: 10,
  },
  subHeader: {
    fontSize: 18,

    marginBottom: 30,
    fontFamily: "Roboto-Regular", // Ensure you have the appropriate font imported
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 100,
    backgroundColor: colors.primary,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Roboto-Bold", // Ensure you have the appropriate font imported
  },
});

export default OnboardingScreen;
