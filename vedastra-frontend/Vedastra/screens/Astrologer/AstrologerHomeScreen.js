import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Switch,
  FlatList,
} from "react-native";
import axiosInstance from "../../api/axiosInstance";
import { removeToken } from "../../utils/tokenStorage";

const AstrologerHomeScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [liveConsultations, setLiveConsultations] = useState([]);

  // Fetch astrologer profile
  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/astrologers/me");
      setProfile(response.data);
      setIsAvailable(response.data.isAvailable); // Set availability state from profile data
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live consultations
  const fetchLiveConsultations = async () => {
    try {
      const response = await axiosInstance.get("/consultations/live");
      setLiveConsultations(response.data);
    } catch (error) {
      console.error("Fetch live consultations error:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await removeToken();
      navigation.navigate("AstrologerLogin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle availability toggle
  const handleToggleAvailability = async () => {
    try {
      await axiosInstance.patch("/astrologers/me/availability", {
        isAvailable: !isAvailable,
      });
      setIsAvailable(!isAvailable); // Update local state
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchLiveConsultations();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No profile data available.</Text>
      </View>
    );
  }

  // Destructure and provide default values
  const {
    name,
    email,
    specializations = [],
    availability = {},
    ratings = {},
  } = profile;
  const days = availability.days || [];
  const timeSlots = availability.timeSlots || [];
  const averageRating = ratings.average || "N/A";
  const reviewsCount = ratings.reviewsCount || "N/A";

  const renderConsultationItem = ({ item }) => (
    <View style={styles.consultationItem}>
      <Text style={styles.consultationText}>Consultation ID: {item._id}</Text>
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.header}>Welcome, {name}</Text>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <Text style={styles.detailText}>Name: {name}</Text>
          <Text style={styles.detailText}>Email: {email}</Text>
          <Text style={styles.detailText}>
            Specializations: {specializations.join(", ")}
          </Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Availability</Text>
          {/* <Text style={styles.detailText}>Days: {days.join(", ")}</Text>
          <Text style={styles.detailText}>
            Time Slots: {timeSlots.join(", ")}
          </Text> */}
          <View style={styles.toggleContainer}>
            <Text style={styles.detailText}>Available for consultations:</Text>
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
            />
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Ratings</Text>
          <Text style={styles.detailText}>Average Rating: {averageRating}</Text>
          <Text style={styles.detailText}>Reviews Count: {reviewsCount}</Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Live Consultations</Text>
          {liveConsultations.length === 0 ? (
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

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("UpcomingConsultations")}
        >
          <Text style={styles.buttonText}>Upcoming Consultations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, styles.logoutButtonText]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6c757d",
  },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  profileContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 16,
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 4,
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
  logoutButton: {
    backgroundColor: "#dc3545",
  },
  logoutButtonText: {
    color: "#ffffff",
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
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginBottom: 10,
  },
  consultationText: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 8,
  },
  chatButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

export default AstrologerHomeScreen;
