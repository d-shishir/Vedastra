import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";
import axiosInstance from "../api/axiosInstance";
import { AuthContext } from "../contexts/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../utils/colors";
import { fonts } from "../utils/fonts";
import { SafeAreaView } from "react-native-safe-area-context";
import { removeToken } from "../utils/tokenStorage";

const ProfileScreen = ({ navigation }) => {
  const { userId, userRole } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      let endpoint = "";

      if (userRole === "user") {
        endpoint = "auth/me";
      } else if (userRole === "astrologer") {
        endpoint = "astrologers/me";
      } else {
        console.error("Unknown userRole:", userRole);
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(endpoint);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userRole]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          {error ? "Failed to load profile data" : "Profile data not found"}
        </Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await removeToken();
      if (userRole === "astrologer") {
        navigation.navigate("AstrologerLogin");
      } else {
        navigation.navigate("UserLogin");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const {
    name,
    email,
    profilePicture,
    birthdate,
    preferences,
    birthplace,
    specializations,
    isAvailable,
    ratings,
  } = profileData;

  // Extract birth time from birthdate
  const birthDateObj = new Date(birthdate);
  const birthTime = birthDateObj.toLocaleTimeString();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButtonWrapper}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" color={colors.primary} size={25} />
      </TouchableOpacity>
      <View style={styles.profilePictureContainer}>
        <Image
          source={{
            uri: profilePicture || "https://via.placeholder.com/120",
          }}
          style={styles.profilePicture}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.nameText}>{name || "No name provided"}</Text>
        <Text style={styles.emailText}>{email || "No email provided"}</Text>
        {userRole === "user" && (
          <>
            <Text style={styles.birthText}>
              Birthdate:{" "}
              {birthdate
                ? new Date(birthdate).toLocaleDateString()
                : "No birthdate provided"}
            </Text>
            <Text style={styles.birthText}>
              Birth Time: {birthTime || "No birth time provided"}
            </Text>
            <Text style={styles.birthText}>
              Birthplace: {birthplace || "No birthplace provided"}
            </Text>
            <Text style={styles.preferencesText}>
              Daily Horoscope: {preferences?.dailyHoroscope ? "Yes" : "No"}
            </Text>
            <Text style={styles.preferencesText}>
              Personalized Readings:{" "}
              {preferences?.personalizedReadings ? "Yes" : "No"}
            </Text>
          </>
        )}
        {userRole === "astrologer" && (
          <>
            <Text style={styles.specializationsText}>
              Specializations:{" "}
              {specializations?.join(", ") || "No specializations"}
            </Text>
            <Text style={styles.availabilityText}>
              Availability: {isAvailable ? "Available" : "Not Available"}
            </Text>
            <Text style={styles.ratingsText}>
              Average Rating: {ratings?.average || "No ratings"}
            </Text>
            <Text style={styles.ratingsText}>
              Reviews Count: {ratings?.reviewsCount || "No reviews"}
            </Text>
          </>
        )}
      </View>
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.white,
    justifyContent: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.accent,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  infoContainer: {
    backgroundColor: "white", // Sets the background color to white
    borderWidth: 1, // Sets the border width
    borderColor: "black", // Sets the border color to white
    borderRadius: 5,
    marginHorizontal: 20,
    padding: 20,
  },
  nameText: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  emailText: {
    fontSize: 18,
    color: colors.secondary,
    fontFamily: fonts.Light,
    textAlign: "center",
    marginBottom: 10,
  },
  birthText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  preferencesText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  specializationsText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  availabilityText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  ratingsText: {
    fontSize: 16,
    color: colors.secondary,
    fontFamily: fonts.Regular,
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: colors.white,
    fontFamily: fonts.SemiBold,
  },
});

export default ProfileScreen;
