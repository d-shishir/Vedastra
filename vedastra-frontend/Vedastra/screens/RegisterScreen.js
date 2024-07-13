import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axiosInstance from "../api/axiosInstance";
import { storeToken } from "../utils/tokenStorage";
import { searchLocation } from "../utils/locationiq"; // Import the LocationIQ utility
import debounce from "lodash/debounce";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [birthtime, setBirthtime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [birthplace, setBirthplace] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [locationResults, setLocationResults] = useState([]);

  const handleRegister = async () => {
    if (!name || !email || !password || !birthdate || !birthplace) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      let combinedBirthdate = new Date(birthdate);
      combinedBirthdate.setHours(birthtime.getHours());
      combinedBirthdate.setMinutes(birthtime.getMinutes());

      const response = await axiosInstance.post("/users/register", {
        name,
        email,
        password,
        birthdate: combinedBirthdate.toISOString(),
        birthplace,
        profilePicture,
        preferences: {
          dailyHoroscope: true,
          personalizedReadings: true,
        },
      });

      await storeToken(response.data.token);

      Alert.alert("Success", "Registered successfully!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        const { data } = error.response;
        Alert.alert("Error", data.msg || "Registration failed");
      } else {
        Alert.alert("Error", "Registration failed. Please try again later.");
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setBirthtime(selectedTime);
    }
  };

  const debouncedLocationSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 2) {
        try {
          const results = await searchLocation(query);
          setLocationResults(
            results.map((result) => ({
              id: result.place_id,
              description: result.display_name,
            }))
          );
        } catch (error) {
          console.error("Error fetching location data:", error);
        }
      } else {
        setLocationResults([]);
      }
    }, 300), // Debounce by 300ms
    []
  );

  const handleBirthplaceChange = (query) => {
    setBirthplace(query);
    debouncedLocationSearch(query);
  };

  const handleLocationSelect = (description) => {
    setBirthplace(description);
    setLocationResults([]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled" // Ensure taps outside text inputs dismiss keyboard
    >
      <TextInput
        style={styles.input}
        placeholder="Name (required)"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email (required)"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (required)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {Platform.OS === "ios" ? (
        <View>
          <Button
            title="Select Birthdate"
            onPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={birthdate}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      ) : (
        <View>
          <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
          <Button title="Select Time" onPress={() => setShowTimePicker(true)} />
          {showDatePicker && (
            <DateTimePicker
              value={birthdate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={birthtime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter Birthplace (required)"
        value={birthplace}
        onChangeText={handleBirthplaceChange}
      />
      {locationResults.length > 0 && (
        <FlatList
          data={locationResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleLocationSelect(item.description)}
            >
              <Text style={styles.locationItem}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Profile Picture URL"
        value={profilePicture}
        onChangeText={setProfilePicture}
      />
      <Button title="Register" onPress={handleRegister} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default RegisterScreen;
