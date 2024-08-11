import React, { useEffect, useState } from "react";
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
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";

const AstrologerConsultationScreen = ({ navigation }) => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch consultations for the astrologer
  const fetchConsultations = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const astrologerId = await AsyncStorage.getItem("astrologerId");
      const response = await axiosInstance.get("/consultations", {
        headers: { Authorization: `Bearer ${token}` },
        params: { astrologerId },
      });
      setConsultations(response.data);
    } catch (error) {
      console.error("Fetch consultations error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle cancelling a consultation
  const handleCancel = async (consultationId) => {
    try {
      await axiosInstance.patch("/consultations/status", {
        consultationId,
        status: "canceled",
      });
      fetchConsultations(); // Refresh the list after cancelling
    } catch (error) {
      console.error("Cancel consultation error:", error);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // Render a single consultation item
  const renderConsultationItem = ({ item }) => (
    <View style={styles.consultationItem}>
      <Text style={styles.consultationTitle}>User: {item.userId.name}</Text>
      <Text style={styles.consultationText}>
        {new Date(item.scheduledAt).toLocaleString()}
      </Text>
      <Text style={styles.consultationText}>Status: {item.status}</Text>
      {item.status === "scheduled" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item._id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Consultation</Text>
        </TouchableOpacity>
      )}
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
    </View>
  );

  // Separate consultations by status
  const liveConsultations = consultations.filter((c) => c.status === "live");
  const scheduledConsultations = consultations.filter(
    (c) => c.status === "scheduled"
  );
  const completedConsultations = consultations.filter(
    (c) => c.status === "completed"
  );
  const canceledConsultations = consultations.filter(
    (c) => c.status === "canceled"
  );

  return (
    <View style={styles.container}>
      {liveConsultations.length > 0 && (
        <>
          <Text style={styles.header}>Live Consultations</Text>
          <FlatList
            data={liveConsultations}
            renderItem={renderConsultationItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.consultationList}
          />
        </>
      )}
      {scheduledConsultations.length > 0 && (
        <>
          <Text style={styles.header}>Scheduled Consultations</Text>
          <FlatList
            data={scheduledConsultations}
            renderItem={renderConsultationItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.consultationList}
          />
        </>
      )}
      {completedConsultations.length > 0 && (
        <>
          <Text style={styles.header}>Completed Consultations</Text>
          <FlatList
            data={completedConsultations}
            renderItem={renderConsultationItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.consultationList}
          />
        </>
      )}
      {canceledConsultations.length > 0 && (
        <>
          <Text style={styles.header}>Canceled Consultations</Text>
          <FlatList
            data={canceledConsultations}
            renderItem={renderConsultationItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.consultationList}
          />
        </>
      )}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
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
  consultationList: {
    marginTop: 20,
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
    fontSize: 18,
    color: "black",
    marginBottom: 8,
  },
  consultationTitle: {
    fontSize: 24,
    color: "black",
    marginBottom: 8,
    fontWeight: "bold",
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
});

export default AstrologerConsultationScreen;
