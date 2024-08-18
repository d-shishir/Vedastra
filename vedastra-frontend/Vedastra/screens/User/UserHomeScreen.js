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
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../api/axiosInstance";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import Ionicons from "react-native-vector-icons/Ionicons";

const HomeScreen = ({ navigation }) => {
  const [horoscopeText, setHoroscopeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [astrologers, setAstrologers] = useState([]);
  const [recommendedAstrologers, setRecommendedAstrologers] = useState([]);
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

  const fetchRecommendedAstrologers = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("User ID:", userId);

      if (!userId) {
        throw new Error("User ID is missing");
      }

      const response = await axiosInstance.get(`/astrologers/recommend`, {
        params: { userId },
      });

      console.log("Recommended Astrologers Response:", response.data);

      // Filter out astrologers with a score of 0
      const filteredAstrologers = response.data.filter(
        (astrologer) => astrologer.score > 0
      );

      // Sort the astrologers by score in descending order
      const sortedAstrologers = filteredAstrologers.sort(
        (a, b) => b.score - a.score
      );

      // Get the top 2 astrologers
      const topTwoAstrologers = sortedAstrologers.slice(0, 2);

      setRecommendedAstrologers(topTwoAstrologers);
    } catch (error) {
      console.error("Fetch recommended astrologers error:", error);
      setError("Error fetching recommended astrologers.");
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

  useEffect(() => {}, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchHoroscope();
      fetchAstrologers();
      fetchActiveConsultation();
      fetchRecommendedAstrologers();
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
      <Image
        source={{
          uri: item.profilePicture || "https://via.placeholder.com/50",
        }}
        style={styles.profilePicture}
      />
      <Text style={styles.astrologerName}>{item.name} </Text>
      <Text style={styles.specializationsText}>
        Specializations: {item.specializations.join(", ")}
      </Text>
      <View style={styles.astroItem}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => startConsultation(item._id)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={colors.white}
            />
            <Text style={styles.chatButtonText}>
              {activeConsultation &&
              activeConsultation.astrologerId._id === item._id
                ? "Continue Chat"
                : "Let's Chat"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate("AstroDetail", {
                id: item._id,
              })
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const filteredAstrologers = activeConsultation
    ? astrologers.filter(
        (astrologer) => astrologer._id === activeConsultation.astrologerId._id
      )
    : astrologers;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Today's Horoscope!</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <Text style={styles.horoscopeText}>{horoscopeText}</Text>
            )}

            {!activeConsultation && (
              <>
                <Text style={styles.headerTwo}>Recommended Astrologers</Text>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : recommendedAstrologers.length === 0 ? (
                  <Text>No recommended astrologers</Text>
                ) : (
                  <FlatList
                    data={recommendedAstrologers}
                    renderItem={renderAstrologerItem}
                    keyExtractor={(item) => item._id.toString()}
                  />
                )}
              </>
            )}

            <Text style={styles.headerTwo}>Available Astrologers</Text>
          </>
        }
        data={filteredAstrologers}
        renderItem={renderAstrologerItem}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingHorizontal: 20 }}
      />
      {/* <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color={colors.primary} />
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
  },
  headerTwo: {
    fontSize: 24,
    marginBottom: 5,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
  },
  horoscopeText: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 20,
    fontFamily: fonts.Light,
  },

  astrologerItem: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    padding: 16,
    backgroundColor: colors.white,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  astroItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  astrologerName: {
    fontSize: 18,
    fontFamily: fonts.SemiBold,
    marginBottom: 5,
    color: colors.primary,
  },
  specializationsText: {
    fontSize: 14,
    color: colors.secondary,
    fontFamily: fonts.Light,
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  chatButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.SemiBold,
    marginLeft: 5,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  detailsButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    marginLeft: 5,
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
