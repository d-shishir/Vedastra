import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList } from "react-native";
import axiosInstance from "../../api/axiosInstance";

const AcceptConsultationScreen = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch consultations
  const fetchConsultations = async () => {
    try {
      const response = await axiosInstance.get("/consultations/pending");
      setConsultations(response.data);
    } catch (error) {
      console.error("Fetch consultations error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // Handle accepting a consultation
  const handleAccept = async (consultationId) => {
    try {
      await axiosInstance.post(`/consultations/${consultationId}/accept`);
      fetchConsultations(); // Refresh the list
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  // Handle rejecting a consultation
  const handleReject = async (consultationId) => {
    try {
      await axiosInstance.post(`/consultations/${consultationId}/reject`);
      fetchConsultations(); // Refresh the list
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  const renderConsultation = ({ item }) => (
    <View style={styles.consultationItem}>
      <Text>{item.user.name}</Text>
      <Text>Scheduled At: {new Date(item.scheduledAt).toLocaleString()}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Accept"
          onPress={() => handleAccept(item._id)}
          color="#28a745"
        />
        <Button
          title="Reject"
          onPress={() => handleReject(item._id)}
          color="#dc3545"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pending Consultations</Text>
      {loading ? (
        <Text>Loading consultations...</Text>
      ) : (
        <FlatList
          data={consultations}
          renderItem={renderConsultation}
          keyExtractor={(item) => item._id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  consultationItem: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 16,
    borderColor: "#ced4da",
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
});

export default AcceptConsultationScreen;
