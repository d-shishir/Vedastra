import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axiosInstance from "../../api/axiosInstance";

const AstrologerRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [availability, setAvailability] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await axiosInstance.post("/astrologers/register", {
        name,
        email,
        password,
        specializations: specializations.split(",").map((spec) => spec.trim()), // Convert to array
        availability: availability.split(",").map((slot) => slot.trim()), // Convert to array
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      <TextInput
        style={styles.input}
        placeholder="Availability (comma-separated)"
        placeholderTextColor="#888"
        value={availability}
        onChangeText={setAvailability}
      />
      <View style={styles.pickerContainer}>
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
      </View>
      <Button title="Register" onPress={handleRegister} color="#007bff" />
      <Button
        title="Back to Login"
        onPress={() => navigation.navigate("AstrologerLogin")}
        color="#6c757d"
      />
    </ScrollView>
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
  pickerContainer: {
    marginBottom: 16,
  },
  selectedTime: {
    marginTop: 8,
    fontSize: 16,
    color: "#343a40",
  },
});

export default AstrologerRegisterScreen;
