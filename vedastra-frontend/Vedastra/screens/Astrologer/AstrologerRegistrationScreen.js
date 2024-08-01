import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  FlatList,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import MultiSelect from "react-native-multiple-select";
import axiosInstance from "../../api/axiosInstance";

const daysOfWeek = [
  { id: "1", name: "Monday" },
  { id: "2", name: "Tuesday" },
  { id: "3", name: "Wednesday" },
  { id: "4", name: "Thursday" },
  { id: "5", name: "Friday" },
  { id: "6", name: "Saturday" },
  { id: "7", name: "Sunday" },
];

const timeSlots = [
  { id: "1", name: "9:00 AM - 10:00 AM" },
  { id: "2", name: "10:00 AM - 11:00 AM" },
  { id: "3", name: "11:00 AM - 12:00 PM" },
  { id: "4", name: "1:00 PM - 2:00 PM" },
  { id: "5", name: "2:00 PM - 3:00 PM" },
  { id: "6", name: "3:00 PM - 4:00 PM" },
  { id: "7", name: "4:00 PM - 5:00 PM" },
];

const AstrologerRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());

  const handleRegister = async () => {
    // Convert selected IDs to values
    const selectedDayNames = daysOfWeek
      .filter((day) => selectedDays.includes(day.id))
      .map((day) => day.name);

    const selectedSlotNames = timeSlots
      .filter((slot) => selectedTimeSlots.includes(slot.id))
      .map((slot) => slot.name);

    try {
      const response = await axiosInstance.post("/astrologers/register", {
        name,
        email,
        password,
        specializations: specializations.split(",").map((spec) => spec.trim()), // Convert to array
        availability: {
          days: selectedDayNames, // Send the day names
          timeSlots: selectedSlotNames, // Send the slot names
        }, // Include selected days and time slots
        startTime: startTime.toISOString(), // Convert date to ISO string
      });

      Alert.alert("Success", "Astrologer registered successfully");
      navigation.navigate("AstrologerLogin"); // Navigate to login screen or another screen
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Failed to register astrologer");
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{item.label}</Text>
      <MultiSelect
        items={item.items}
        uniqueKey="id"
        ref={(component) => {
          this.multiSelect = component;
        }}
        onSelectedItemsChange={item.onChange}
        selectedItems={item.selectedItems}
        selectText={item.selectText}
        searchInputPlaceholderText={`Search ${item.label}...`}
        styleDropdownMenu={styles.dropdownMenu}
        styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
        styleMainWrapper={styles.mainWrapper}
        styleInputGroup={styles.inputGroup}
        styleTextDropdown={styles.textDropdown}
      />
      <Text style={styles.selectedItems}>
        Selected {item.label}:{" "}
        {item.selectedItems
          .map((id) => item.items.find((el) => el.id === id)?.name)
          .join(", ")}
      </Text>
    </View>
  );

  const data = [
    {
      label: "Days",
      items: daysOfWeek,
      onChange: setSelectedDays,
      selectedItems: selectedDays,
      selectText: "Pick Days",
    },
    {
      label: "Time Slots",
      items: timeSlots,
      onChange: setSelectedTimeSlots,
      selectedItems: selectedTimeSlots,
      selectText: "Pick Time Slots",
    },
  ];

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.label}
      ListHeaderComponent={
        <>
          <Text style={styles.header}>Register as Astrologer</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Specializations (comma-separated)"
            placeholderTextColor="#888"
            value={specializations}
            onChangeText={setSpecializations}
          />
        </>
      }
      ListFooterComponent={
        <>
          {/* Uncomment if you need time picker functionality */}
          {/* <View style={styles.pickerContainer}>
            <Button
              title="Select Start Time"
              onPress={() => setShowTimePicker(true)}
            />
            {showTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
            <Text style={styles.selectedTime}>
              Selected Time: {startTime.toLocaleTimeString()}
            </Text>
          </View> */}
          <Button title="Register" onPress={handleRegister} color="#007bff" />
          <Button
            title="Back to Login"
            onPress={() => navigation.navigate("AstrologerLogin")}
            color="#6c757d"
          />
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 8,
  },
  dropdownMenu: {
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownMenuSubsection: {
    borderColor: "#ced4da",
  },
  mainWrapper: {
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
  },
  inputGroup: {
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
  },
  textDropdown: {
    fontSize: 16,
    color: "#343a40",
  },
  selectedItems: {
    marginTop: 8,
    fontSize: 16,
    color: "#343a40",
  },
  selectedTime: {
    marginTop: 8,
    fontSize: 16,
    color: "#343a40",
  },
});

export default AstrologerRegisterScreen;
