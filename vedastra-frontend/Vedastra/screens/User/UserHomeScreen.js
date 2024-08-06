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
  const [error, setError] = useState(null);

  // Function to fetch today's zodiac sign and horoscope
  const fetchHoroscope = async () => {
    try {
      const zodiacResponse = await axiosInstance.get("/dailyHoroscopes");
      const zodiacSign = zodiacResponse.data.zodiacSign;

      if (zodiacSign) {
        const horoscopeResponse = await axiosInstance.get(
          `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${zodiacSign}&day=TODAY`
        );
        setHoroscopeText(horoscopeResponse.data.data.horoscope_data);
      } else {
        setHoroscopeText("No zodiac sign found.");
      }
    } catch (error) {
      console.error("Fetch horoscope error:", error);
      setHoroscopeText("Failed to fetch today's horoscope.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch the list of available astrologers
  const fetchAstrologers = async () => {
    try {
      const response = await axiosInstance.get("/astrologers");
      const availableAstrologers = response.data.filter(
        (astrologer) => astrologer.isAvailable
      );
      setAstrologers(availableAstrologers);
    } catch (error) {
      console.error("Fetch astrologers error:", error);
      setError("Error fetching astrologers.");
    }
  };

  const startConsultation = async (astrologerId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!astrologerId) {
        throw new Error("Astrologer ID is missing");
      }

      const response = await axiosInstance.post(
        `/consultations/${astrologerId}/start`,
        { communicationType: "chat" }, // Ensure this matches what the backend expects
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const consultationId = response.data._id;
      navigation.navigate("ChatScreen", { consultationId });
    } catch (error) {
      console.error(
        "Start consultation error:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to start the consultation.");
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
      setError("Failed to log out.");
    }
  };

  // Render a single astrologer item
  const renderAstrologerItem = ({ item }) => (
    <View style={styles.astrologerItem}>
      <Text style={styles.astrologerName}>{item.name}</Text>
      <Text>Specializations: {item.specializations.join(", ")}</Text>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => startConsultation(item._id)}
      >
        <Text style={styles.chatButtonText}>Let's Chat</Text>
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
        <Text style={styles.horoscopeText}>{horoscopeText}</Text>
      )}
      <Text style={styles.header}>Available Astrologers</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : astrologers.length === 0 ? (
        <Text>No astrologers available</Text>
      ) : (
        <FlatList
          data={astrologers}
          renderItem={renderAstrologerItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.astrologerList}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ConsultationStatus")}
      >
        <Text style={styles.buttonText}>View My Consultations</Text>
      </TouchableOpacity>
      <Button title="Logout" onPress={handleLogout} color="#007bff" />
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
  horoscopeText: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 20,
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
  chatButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    marginTop: 10,
  },
});

export default HomeScreen;
