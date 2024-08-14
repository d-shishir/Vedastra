import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";

const HomeScreen = ({ navigation }) => {
  const [horoscopeText, setHoroscopeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [astrologers, setAstrologers] = useState([]);
  const [error, setError] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);

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

  const fetchActiveConsultation = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (token && userId) {
        // Fetch all consultations
        const response = await axiosInstance.get("/consultations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the user's active consultation with status "live"
        const userLiveConsultations = response.data.filter(
          (consultation) =>
            consultation.userId._id === userId && consultation.status === "live"
        );

        // Assuming you want to display the first live consultation if multiple are found
        setActiveConsultation(userLiveConsultations[0] || null);
      } else {
        throw new Error("Token or user ID is missing.");
      }
    } catch (error) {
      console.error("Fetch active consultation error:", error);
      setError("Failed to fetch active consultation.");
    }
  };

  const startConsultation = async (astrologerId) => {
    try {
      if (activeConsultation) {
        // If there's an active consultation, navigate to the chat screen
        navigation.navigate("ChatScreen", {
          consultationId: activeConsultation._id,
        });
        return;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("User is not authenticated. Token is missing.");
      }
      if (!astrologerId) {
        throw new Error("Astrologer ID is missing");
      }

      const response = await axiosInstance.post(
        `/consultations/start`,
        { astrologerId, communicationType: "chat" },
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

  fetchHoroscope();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      fetchAstrologers();
      fetchActiveConsultation();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.navigate("UserLogin");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to log out.");
    }
  };
  const renderAstrologerItem = ({ item }) => (
    <View style={styles.astrologerItem}>
      <Text style={styles.astrologerName}>{item.name}</Text>
      <Text>Specializations: {item.specializations.join(", ")}</Text>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => startConsultation(item._id)}
      >
        <Text style={styles.chatButtonText}>
          {activeConsultation &&
          activeConsultation.astrologerId._id === item._id
            ? "Continue Chat"
            : "Let's Chat"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filteredAstrologers = activeConsultation
    ? astrologers.filter(
        (astrologer) => astrologer._id === activeConsultation.astrologerId._id
      )
    : astrologers;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Home Screen</Text>
      <Text style={styles.header}>Today's Horoscope!</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Text style={styles.horoscopeText}>{horoscopeText}</Text>
      )}
      <Text style={styles.header}>Available Astrologers</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredAstrologers.length === 0 ? (
        <Text>No astrologers available</Text>
      ) : (
        <FlatList
          data={filteredAstrologers}
          renderItem={renderAstrologerItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.astrologerList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
  },
  horoscopeText: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 20,
    fontFamily: fonts.Light,
  },
  astrologerList: {
    marginTop: 20,
  },
  astrologerItem: {
    padding: 16,
    backgroundColor: colors.white,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  astrologerName: {
    fontSize: 18,
    fontFamily: fonts.SemiBold,
    marginBottom: 8,
    color: colors.primary,
  },
  chatButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
    alignItems: "center",
  },
  chatButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.SemiBold,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: colors.white,
    fontFamily: fonts.SemiBold,
  },
  logoutButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: colors.white,
    fontFamily: fonts.SemiBold,
  },
  errorText: {
    color: colors.accent,
    fontSize: 16,
    marginTop: 10,
    fontFamily: fonts.Regular,
  },
});

export default HomeScreen;
