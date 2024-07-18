import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../api/axiosInstance";

const HomeScreen = ({ navigation }) => {
  const [horoscopeText, setHoroscopeText] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch today's horoscope
  const fetchHoroscope = async () => {
    try {
      const response = await axiosInstance.get("/dailyHoroscopes");
      setHoroscopeText(response.data[0].horoscopeText); // Accessing the first element's horoscopeText
      console.log(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      setHoroscopeText("Failed to fetch today's horoscope");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscope();
  }, []);

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
      <Text style={styles.header}>Today's Horoscope!</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>{horoscopeText}</Text>
      )}
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
