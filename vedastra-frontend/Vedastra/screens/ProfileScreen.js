import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Pressable,
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
      <View style={styles.errorContainer}>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonWrapper}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" color="white" size={25} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{name || "No name provided"}</Text>
        </View>
        <Image
          source={{
            uri: profilePicture || "https://via.placeholder.com/120",
          }}
          style={styles.avatar}
        />
      </View>
      <View style={styles.body}>
        <Pressable style={styles.infoContainer}>
          {userRole === "user" && (
            <>
              <Text style={styles.infoText}>
                Birthdate:{" "}
                {birthdate
                  ? new Date(birthdate).toLocaleDateString()
                  : "No birthdate provided"}
              </Text>
              <Text style={styles.infoText}>
                Birth Time: {birthTime || "No birth time provided"}
              </Text>
              <Text style={styles.infoText}>
                Birthplace: {birthplace || "No birthplace provided"}
              </Text>
              <Text style={styles.infoText}>
                Daily Horoscope: {preferences?.dailyHoroscope ? "Yes" : "No"}
              </Text>
              <Text style={styles.infoText}>
                Personalized Readings:{" "}
                {preferences?.personalizedReadings ? "Yes" : "No"}
              </Text>
            </>
          )}
          {userRole === "astrologer" && (
            <>
              <Text style={styles.infoText}>
                Specializations:{" "}
                {specializations?.join(", ") || "No specializations"}
              </Text>
              <Text style={styles.infoText}>
                Availability: {isAvailable ? "Available" : "Not Available"}
              </Text>
              <Text style={styles.infoText}>
                Average Rating: {ratings?.average || "No ratings"}
              </Text>
              <Text style={styles.infoText}>
                Reviews Count: {ratings?.reviewsCount || "No reviews"}
              </Text>
            </>
          )}
        </Pressable>
        <TouchableOpacity style={styles.btn} onPress={handleLogout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "#3B525F", // Background color
    height: 200,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonWrapper: {
    position: "absolute",
    top: 20,
    left: 10,
    height: 40,
    width: 40,
    backgroundColor: colors.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "white",
    marginVertical: 10,
  },
  name: {
    fontSize: 22,
    color: "white",
    fontWeight: "600",
    fontFamily: "Helvetica",
    textAlign: "center",
  },
  userInfo: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  body: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 20,
  },
  infoContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: "black",
    fontWeight: "550",
    fontFamily: "Helvetica",
    marginBottom: 10,
  },
  btn: {
    marginTop: 20,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 200,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Helvetica",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    fontFamily: "Helvetica",
    textAlign: "center",
  },
});

export default ProfileScreen;
