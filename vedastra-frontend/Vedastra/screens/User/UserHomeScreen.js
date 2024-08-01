import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../api/axiosInstance";

const HomeScreen = ({ navigation }) => {
  const [horoscopeText, setHoroscopeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [astrologers, setAstrologers] = useState([]);

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

  // Function to fetch the list of astrologers
  const fetchAstrologers = async () => {
    try {
      const response = await axiosInstance.get("/astrologers");
      setAstrologers(response.data);
    } catch (error) {
      console.error("Fetch astrologers error:", error);
    }
  };

  useEffect(() => {
    fetchHoroscope();
    fetchAstrologers();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.navigate("UserLogin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Render a single astrologer item
  const renderAstrologerItem = ({ item }) => (
    <View style={styles.astrologerItem}>
      <Text style={styles.astrologerName}>{item.name}</Text>
      <Text>Specializations: {item.specializations.join(", ")}</Text>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate("BookingScreen", { astrologerId: item._id })
        }
      >
        <Text style={styles.bookButtonText}>Book Consultation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Home Screen</Text>
      <Text style={styles.header}>Today's Horoscope!</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text>{horoscopeText}</Text>
      )}
      <Text style={styles.header}>Available Astrologers</Text>
      <FlatList
        data={astrologers}
        renderItem={renderAstrologerItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.astrologerList}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ConsultationStatus")}
      >
        <Text style={styles.buttonText}>View My Consultations</Text>
      </TouchableOpacity>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#343a40",
  },
  astrologerList: {
    marginTop: 20,
  },
  astrologerItem: {
    padding: 16,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  astrologerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bookButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  bookButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

export default HomeScreen;
