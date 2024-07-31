import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../api/axiosInstance";

const HomeScreen = ({ navigation }) => {
  const [horoscopeText, setHoroscopeText] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to fetch today's zodiac sign and horoscope
  const fetchHoroscope = async () => {
    try {
      // Step 1: Fetch the zodiac sign from your API
      const zodiacResponse = await axiosInstance.get("/dailyHoroscopes");
      const zodiacSign = zodiacResponse.data.zodiacSign;

      // Step 2: Fetch the horoscope text from the external API using the zodiac sign
      if (zodiacSign) {
        const horoscopeResponse = await axiosInstance.get(
          `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${zodiacSign}&day=TODAY`
        );
        setHoroscopeText(horoscopeResponse.data.data.horoscope_data);
      } else {
        setHoroscopeText("No zodiac sign found.");
      }
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
      navigation.navigate("UserLogin"); // Navigate back to Login screen
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
