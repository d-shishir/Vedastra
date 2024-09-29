import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axiosInstance from "../../api/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../../utils/colors";

const ConsultationStatusScreen = ({ navigation }) => {
  const [consultations, setConsultations] = useState({
    scheduled: [],
    completed: [],
    canceled: [],
    live: [],
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch user's consultations
  const fetchConsultations = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axiosInstance.get("/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedConsultations = {
        scheduled: [],
        completed: [],
        canceled: [],
        live: [],
      };

      response.data.forEach((consultation) => {
        if (consultation.status === "scheduled") {
          sortedConsultations.scheduled.push(consultation);
        } else if (consultation.status === "completed") {
          sortedConsultations.completed.push(consultation);
        } else if (consultation.status === "canceled") {
          sortedConsultations.canceled.push(consultation);
        } else if (consultation.status === "live") {
          sortedConsultations.live.push(consultation);
        }
      });

      setConsultations(sortedConsultations);
    } catch (error) {
      console.error("Fetch consultations error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch consultations when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchConsultations();
    }, [fetchConsultations])
  );

  // Function to handle cancelling a consultation
  const handleCancel = async (consultationId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axiosInstance.patch(
        `/consultations/${consultationId}/status`, // Include the consultation ID in the URL
        { status: "canceled" }, // Send only the status in the request body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchConsultations(); // Refresh the list after cancelling
    } catch (error) {
      console.error("Cancel consultation error:", error);
    }
  };

  // Function to handle starting a new consultation with the same astrologer
  const handleChatAgain = async (astrologerId) => {
    try {
      if (!astrologerId) {
        throw new Error("Astrologer ID is missing.");
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("User is not authenticated. Token is missing.");
      }

      // Check if there is already an active consultation
      if (consultations.live.length > 0) {
        // Navigate to the active live consultation's chat screen
        const activeConsultation = consultations.live[0]; // Assuming the first live consultation is active
        navigation.navigate("ChatScreen", {
          consultationId: activeConsultation._id,
        });
        return;
      }

      // Start a new consultation if there's no active live consultation
      const response = await axiosInstance.post(
        `/consultations/start`,
        { astrologerId, communicationType: "chat" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const consultationId = response.data.consultationId;

      // Navigate to the chat screen for the new consultation
      navigation.navigate("ChatScreen", { consultationId });
    } catch (error) {
      console.error(
        "Start new consultation error:",
        error.response ? error.response.data : error.message
      );
      setError("Failed to start a new consultation.");
    }
  };

  // Render a single consultation item
  // Render a single consultation item
  const renderConsultationItem = ({ item }) => {
    // Check if there is any live consultation
    const hasLiveConsultation = consultations.live.length > 0;

    return (
      <View style={styles.consultationItem}>
        <Text style={styles.consultationTitle}>
          Astrologer: {item.astrologerId.name}
        </Text>
        <Text>Started Date: {new Date(item.createdAt).toLocaleString()}</Text>
        <Text>Status: {item.status}</Text>

        {item.status === "live" && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              navigation.navigate("ChatScreen", { consultationId: item._id })
            }
          >
            <Text style={styles.chatButtonText}>Open Chat</Text>
          </TouchableOpacity>
        )}
        {/* Only show "Chat Again" if there is no live consultation */}
        {item.status === "completed" && !hasLiveConsultation && (
          <TouchableOpacity
            style={styles.chatAgainButton}
            onPress={() => handleChatAgain(item.astrologerId._id)} // Start a new consultation with the same astrologer
          >
            <Text style={styles.chatAgainButtonText}>Chat Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Consultations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {consultations.live.length > 0 && (
            <View style={styles.live}>
              <Text style={styles.sectionHeader}>Live Consultations</Text>
              <FlatList
                data={consultations.live}
                renderItem={renderConsultationItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.consultationList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {consultations.completed.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Completed Consultations</Text>
              <FlatList
                data={consultations.completed}
                renderItem={renderConsultationItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.consultationList}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
          {consultations.canceled.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Canceled Consultations</Text>
              <FlatList
                data={consultations.canceled}
                renderItem={renderConsultationItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.consultationList}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  live: {},
  header: {
    fontSize: 24,
    marginBottom: 0,
    fontWeight: "bold",
    color: "#343a40",
  },
  sectionHeader: {
    fontSize: 20,
    marginTop: 5,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#495057",
  },
  consultationList: {
    marginTop: 0,
  },
  consultationItem: {
    padding: 16,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  chatButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
    alignItems: "center",
  },
  chatButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  chatAgainButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.primary, // You can use any color you'd like
    borderRadius: 5,
    alignItems: "center",
  },
  chatAgainButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

export default ConsultationStatusScreen;
