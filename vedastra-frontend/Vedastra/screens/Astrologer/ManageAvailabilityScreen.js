import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import axiosInstance from "../../api/axiosInstance";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
];

const ManageAvailabilityScreen = () => {
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  // Fetch current availability
  const fetchAvailability = async () => {
    try {
      const response = await axiosInstance.get("/astrologers/me");
      const { availability } = response.data;
      setAvailableDays(availability.days || []);
      setAvailableTimeSlots(availability.timeSlots || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  // Update availability
  const updateAvailability = async () => {
    try {
      await axiosInstance.patch("/astrologers/me/availability", {
        days: availableDays,
        timeSlots: availableTimeSlots,
      });
      Alert.alert("Success", "Availability updated successfully!");
    } catch (error) {
      console.error(
        "Error updating availability:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "Failed to update availability.");
    }
  };

  // Add a new day
  const handleAddDay = () => {
    if (selectedDay && !availableDays.includes(selectedDay)) {
      setAvailableDays([...availableDays, selectedDay]);
      setSelectedDay("");
    } else {
      Alert.alert("Error", "Invalid or duplicate day.");
    }
  };

  // Remove a day
  const handleRemoveDay = (day) => {
    setAvailableDays(availableDays.filter((d) => d !== day));
  };

  // Add a new time slot
  const handleAddTimeSlot = () => {
    if (selectedTimeSlot && !availableTimeSlots.includes(selectedTimeSlot)) {
      setAvailableTimeSlots([...availableTimeSlots, selectedTimeSlot]);
      setSelectedTimeSlot("");
    } else {
      Alert.alert("Error", "Invalid or duplicate time slot.");
    }
  };

  // Remove a time slot
  const handleRemoveTimeSlot = (slot) => {
    setAvailableTimeSlots(availableTimeSlots.filter((s) => s !== slot));
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Manage Availability</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Days</Text>
        {availableDays.length === 0 ? (
          <Text style={styles.emptyMessage}>No days available.</Text>
        ) : (
          availableDays.map((day, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.item}>{day}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveDay(day)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Day:</Text>
          <View style={styles.picker}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.option,
                  selectedDay === day && styles.selectedOption,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDay === day && styles.selectedOptionText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Add Day" onPress={handleAddDay} color="#007bff" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Time Slots</Text>
        {availableTimeSlots.length === 0 ? (
          <Text style={styles.emptyMessage}>No time slots available.</Text>
        ) : (
          availableTimeSlots.map((slot, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.item}>{slot}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveTimeSlot(slot)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Time Slot:</Text>
          <View style={styles.picker}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.option,
                  selectedTimeSlot === slot && styles.selectedOption,
                ]}
                onPress={() => setSelectedTimeSlot(slot)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedTimeSlot === slot && styles.selectedOptionText,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title="Add Time Slot"
            onPress={handleAddTimeSlot}
            color="#007bff"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.updateButton}
        onPress={updateAvailability}
      >
        <Text style={styles.updateButtonText}>Update Availability</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  item: {
    fontSize: 16,
    color: "#495057",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    backgroundColor: "#ffffff",
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
  },
  pickerText: {
    fontSize: 16,
    color: "#495057",
  },
  option: {
    padding: 8,
    borderBottomColor: "#ced4da",
    borderBottomWidth: 1,
  },
  selectedOption: {
    backgroundColor: "#007bff",
  },
  optionText: {
    fontSize: 16,
    color: "#495057",
  },
  selectedOptionText: {
    color: "#ffffff",
  },
  label: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 8,
  },
  updateButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 14,
  },
});

export default ManageAvailabilityScreen;
