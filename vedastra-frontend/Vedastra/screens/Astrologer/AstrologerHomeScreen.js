import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import axiosInstance from "../../api/axiosInstance";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";

const AstrologerHomeScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [liveConsultations, setLiveConsultations] = useState([]);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/astrologers/me");
      setProfile(response.data);
      setIsAvailable(response.data.isAvailable);
    } catch (error) {
      console.error("Fetch profile error:", error);
      setError("Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveConsultations = async () => {
    try {
      const response = await axiosInstance.get("/consultations/live");
      // Filter consultations to include only those related to the current astrologer
      const filteredConsultations = response.data.filter(
        (consultation) => consultation.astrologerId._id === profile._id
      );
      setLiveConsultations(filteredConsultations);
    } catch (error) {
      console.error("Fetch live consultations error:", error);
      setError("Failed to fetch live consultations.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.navigate("AstrologerLogin");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to log out.");
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await axiosInstance.patch("/astrologers/me/availability", {
        isAvailable: !isAvailable,
      });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error("Error updating availability:", error);
      setError("Failed to update availability.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfile();
    }, [])
  );

  // Fetch live consultations only after the profile is loaded
  useEffect(() => {
    if (profile && profile.isVerified) {
      fetchLiveConsultations();
    }
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No profile data available.</Text>
      </View>
    );
  }

  const {
    name,
    email,
    specializations = [],
    availability = {},
    ratings = {},
    verified = false,
  } = profile;

  const days = availability.days || [];
  const timeSlots = availability.timeSlots || [];
  const averageRating = ratings.average || "N/A";
  const reviewsCount = ratings.reviewsCount || "N/A";

  const renderConsultationItem = ({ item }) => (
    <View style={styles.consultationItem}>
      <Text style={styles.consultationText}>{item.userId.name}</Text>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() =>
          navigation.navigate("ChatScreen", { consultationId: item._id })
        }
      >
        <Text style={styles.chatButtonText}>Go to Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButtonWrapper} onPress={handleGoBack}>
        <Ionicons
          name={"arrow-back-outline"}
          color={colors.primary}
          size={25}
        />
      </TouchableOpacity>
      <Text style={styles.header}>Welcome, {name}</Text>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Profile Details</Text>
        <Text style={styles.detailText}>Name: {name}</Text>
        <Text style={styles.detailText}>Email: {email}</Text>
        <Text style={styles.detailText}>
          Specializations: {specializations.join(", ")}
        </Text>
      </View>

      {verified ? (
        <>
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.detailText}>
                Available for consultations:
              </Text>
              <Switch
                style={styles.switch}
                value={isAvailable}
                onValueChange={handleToggleAvailability}
              />
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Live Consultations</Text>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : liveConsultations.length === 0 ? (
              <Text>No live consultations at the moment.</Text>
            ) : (
              <FlatList
                data={liveConsultations}
                renderItem={renderConsultationItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.consultationList}
              />
            )}
          </View>
        </>
      ) : (
        <View style={styles.profileSection}>
          <Text style={styles.errorText}>
            You are not yet verified. Please wait for verification.
          </Text>
        </View>
      )}
      {/* 
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("UpcomingConsultations")}
      >
        <Text style={styles.buttonText}>Upcoming Consultations</Text>
      </TouchableOpacity> */}

      {/* <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
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
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "black",
    fontFamily: fonts.Regular,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.white,
    justifyContent: "flex-start",
  },
  switch: {
    marginStart: 10,
  },
  header: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
    marginVertical: 20,
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.SemiBold,
    color: colors.primary,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: "black",
    fontFamily: fonts.Light,
    marginBottom: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  consultationList: {
    marginTop: 10,
  },
  consultationItem: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 10,
  },
  consultationText: {
    fontSize: 24,
    color: "black",
    marginBottom: 8,
  },
  chatButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
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
  },
  logoutButtonText: {
    color: colors.white,
  },
  errorText: {
    color: colors.accent,
    fontSize: 16,
    marginTop: 10,
    fontFamily: fonts.Regular,
  },
});

export default AstrologerHomeScreen;
