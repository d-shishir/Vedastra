import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axiosInstance from "../../api/axiosInstance";
import { addDays, startOfWeek, parse } from "date-fns";

const BookingScreen = ({ route, navigation }) => {
  const { astrologerId } = route.params;
  const [astrologer, setAstrologer] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  useEffect(() => {
    const fetchAstrologerDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/astrologers/${astrologerId}`
        );
        setAstrologer(response.data);
      } catch (error) {
        console.error("Error fetching astrologer details:", error);
        Alert.alert("Error", "Failed to load astrologer details.");
      }
    };

    fetchAstrologerDetails();
  }, [astrologerId]);

  const getSelectedDate = (day) => {
    const dayMapping = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0, // Sunday is the start of the week for startOfWeek
    };

    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 0 });
    return addDays(startOfCurrentWeek, dayMapping[day]);
  };

  const handleBooking = async () => {
    if (!selectedDay || !selectedTimeSlot) {
      Alert.alert("Error", "Please select a day and time slot.");
      return;
    }

    try {
      const [startTime, endTime] = selectedTimeSlot.split(" - ");
      const selectedDate = getSelectedDate(selectedDay);
      const [hours, minutes, period] = startTime
        .match(/(\d+):(\d+)\s?(AM|PM)/)
        .slice(1);

      let hours24 = parseInt(hours, 10);
      if (period === "PM" && hours24 !== 12) hours24 += 12;
      if (period === "AM" && hours24 === 12) hours24 = 0;

      selectedDate.setHours(hours24);
      selectedDate.setMinutes(parseInt(minutes, 10));
      selectedDate.setSeconds(0);
      selectedDate.setMilliseconds(0);

      console.log("Constructed DateTime Object:", selectedDate);

      // Check if the date is valid
      if (isNaN(selectedDate.getTime())) {
        throw new Error("Invalid date");
      }

      await axiosInstance.post("/consultations/schedule", {
        astrologerId,
        scheduledAt: selectedDate.toISOString(),
        communicationType: "chat",
      });

      Alert.alert("Success", "Consultation booked successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert(
        "Error",
        "Failed to book consultation. Please check the selected date and time."
      );
    }
  };

  if (!astrologer) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading astrologer details...</Text>
      </View>
    );
  }

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
        <Picker.Item label="Select a day" value="" />
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
        <Picker.Item label="Select a time slot" value="" />
        {timeSlots.map((timeSlot) => (
          <Picker.Item key={timeSlot} label={timeSlot} value={timeSlot} />
        ))}
      </Picker>

      <Button
        title="Book Consultation"
        onPress={handleBooking}
        color="#007bff"
      />
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
    width: "100%",
  },
});

export default BookingScreen;
