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

const ChatProfileScreen = ({ navigation, route }) => {
  const { role } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { id, type } = route.params;

  // Ensure that id is a string
  const profileId = typeof id === "object" ? id._id : id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get(
          `auth/profile/${type}/${profileId}`
        );
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, type]);

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

  const {
    name,
    email,
    profilePicture,
    birthdate,
    preferences,
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

        {type === "user" && (
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
              Birthplace: {profileData.birthplace || "No birthplace provided"}
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

        {type === "astrologer" && (
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
            <Button
              title="Leave a Review"
              onPress={() =>
                navigation.navigate("LeaveReview", { astrologerId: profileId })
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "start",
    paddingLeft: 10,
    backgroundColor: colors.white,
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
    marginTop: 20,
  },
  nameText: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    marginBottom: 10,
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
});

export default ChatProfileScreen;
