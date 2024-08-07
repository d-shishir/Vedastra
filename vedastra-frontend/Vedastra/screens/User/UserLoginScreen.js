import React, { useState, useContext } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import axiosInstance from "../../api/axiosInstance";
import { storeToken } from "../../utils/tokenStorage";
import { AuthContext } from "../../contexts/AuthContext";

const UserLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthData } = useContext(AuthContext); // Use context to set auth data

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      const { token } = response.data;

      // Store token in AsyncStorage
      // Store token in AsyncStorage
      await storeToken(token);

      // Fetch astrologer profile
      const meResponse = await axiosInstance.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Pass the response data to setAuthData
      await setAuthData("user", meResponse.data);

      // Navigate to Home screen
      navigation.navigate("UserHome");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Invalid credentials or user ID not found");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} color="#007bff" />
      <Button
        title="Register"
        onPress={() => navigation.navigate("UserRegister")}
        color="#6c757d"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default UserLoginScreen;
