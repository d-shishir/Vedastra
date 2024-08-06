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

const ConsultationStatusScreen = () => {
  const [consultations, setConsultations] = useState({
    scheduled: [],
    completed: [],
    canceled: [],
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch user's consultations
  const fetchConsultations = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axiosInstance.get("/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedConsultations = {
        scheduled: [],
        completed: [],
        canceled: [],
      };

      response.data.forEach((consultation) => {
        if (consultation.status === "scheduled") {
          sortedConsultations.scheduled.push(consultation);
        } else if (consultation.status === "completed") {
          sortedConsultations.completed.push(consultation);
        } else if (consultation.status === "canceled") {
          sortedConsultations.canceled.push(consultation);
        }
      });

      setConsultations(sortedConsultations);
    } catch (error) {
      console.error("Fetch consultations error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchConsultations();
  }, []);

  // Render a single consultation item
  const renderConsultationItem = ({ item }) => (
    <View style={styles.consultationItem}>
      <Text style={styles.consultationTitle}>
        Astrologer: {item.astrologerId.name}
      </Text>
      <Text>Scheduled At: {new Date(item.scheduledAt).toLocaleString()}</Text>
      <Text>Status: {item.status}</Text>
      {item.status === "scheduled" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item._id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Consultation</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Consultations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {consultations.scheduled.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Scheduled Consultations</Text>
              <FlatList
                data={consultations.scheduled}
                renderItem={renderConsultationItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.consultationList}
              />
            </>
          )}
          {consultations.completed.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Completed Consultations</Text>
              <FlatList
                data={consultations.completed}
                renderItem={renderConsultationItem}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.consultationList}
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
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#343a40",
  },
  sectionHeader: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#495057",
  },
  consultationList: {
    marginTop: 10,
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
});

export default ConsultationStatusScreen;
