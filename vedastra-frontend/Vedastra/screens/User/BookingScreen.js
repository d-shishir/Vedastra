import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axiosInstance from "../../api/axiosInstance";

const BookingScreen = ({ route, navigation }) => {
  const { astrologerId } = route.params;
  const [astrologer, setAstrologer] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  // Fetch astrologer details
  const fetchAstrologerDetails = async () => {
    try {
      const response = await axiosInstance.get(`/astrologers/${astrologerId}`);
      setAstrologer(response.data);
    } catch (error) {
      console.error("Error fetching astrologer details:", error);
    }
  };

  useEffect(() => {
    fetchAstrologerDetails();
  }, []);

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedDay || !selectedTimeSlot) {
      Alert.alert("Error", "Please select a day and time slot.");
      return;
    }

    try {
      await axiosInstance.post("/consultations", {
        astrologerId,
        scheduledAt: new Date(`${selectedDay}T${selectedTimeSlot}`),
        communicationType: "chat", // Assuming chat for simplicity
      });
      Alert.alert("Success", "Consultation booked successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("Error", "Failed to book consultation.");
    }
  };

  if (!astrologer) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading astrologer details...</Text>
      </View>
    );
  }

  // Destructure availability to ensure default values
  const { availability } = astrologer;
  const days = availability?.days || [];
  const timeSlots = availability?.timeSlots || [];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Book Consultation with {astrologer.name}
      </Text>
      <Text style={styles.label}>Select Day:</Text>
      <Picker
        selectedValue={selectedDay}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedDay(itemValue)}
      >
        {days.map((day) => (
          <Picker.Item key={day} label={day} value={day} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Time Slot:</Text>
      <Picker
        selectedValue={selectedTimeSlot}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedTimeSlot(itemValue)}
      >
        {timeSlots.map((timeSlot) => (
          <Picker.Item key={timeSlot} label={timeSlot} value={timeSlot} />
        ))}
      </Picker>

      <Button title="Book Consultation" onPress={handleBooking} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    marginTop: 16,
  },
  picker: {
    height: 50,
    width: "100%",
  },
});

export default BookingScreen;
