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
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axiosInstance from "../../api/axiosInstance";
import { storeToken } from "../../utils/tokenStorage";
import { searchLocation } from "../../utils/locationiq"; // Import the LocationIQ utility
import debounce from "lodash/debounce";
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";

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
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [secureEntry, setSecureEntry] = useState(true);

  const handleRegister = async () => {
    if (!name || !email || !password || !birthdate || !birthplace) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      let combinedBirthdate = new Date(birthdate);
      combinedBirthdate.setHours(birthtime.getHours());
      combinedBirthdate.setMinutes(birthtime.getMinutes());

      const response = await axiosInstance.post("/auth/register", {
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
        location: selectedLocation, // Send the selected location details
      });

      await storeToken(response.data.token);

      Alert.alert("Success", "Registered successfully!");
      navigation.navigate("UserHome");
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
              latitude: result.lat,
              longitude: result.lon,
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

  const handleLocationSelect = (location) => {
    setBirthplace(location.description);
    setSelectedLocation({
      city: location.description, // Adjust this based on your needs
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setLocationResults([]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled" // Ensure taps outside text inputs dismiss keyboard
    >
      <TouchableOpacity
        style={styles.backButtonWrapper}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" color={colors.primary} size={25} />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Let's get</Text>
        <Text style={styles.headingText}>started</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            placeholderTextColor={colors.secondary}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor={colors.secondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputContainer}>
          <SimpleLineIcons name="lock" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor={colors.secondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureEntry((prev) => !prev)}>
            <Ionicons
              name={secureEntry ? "eye-off" : "eye"}
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.pickerContainer}>
          <Button
            title="Select Birthdate"
            onPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={birthdate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        <View style={styles.pickerContainer}>
          <Button
            title="Select Birthtime"
            onPress={() => setShowTimePicker(true)}
          />
          {showTimePicker && (
            <DateTimePicker
              value={birthtime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="location-outline"
            size={30}
            color={colors.secondary}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Birthplace"
            placeholderTextColor={colors.secondary}
            value={birthplace}
            onChangeText={handleBirthplaceChange}
          />
          {locationResults.length > 0 && (
            <FlatList
              data={locationResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleLocationSelect(item)}>
                  <Text style={styles.locationItem}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="image-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Profile Picture URL"
            placeholderTextColor={colors.secondary}
            value={profilePicture}
            onChangeText={setProfilePicture}
          />
        </View>
        <TouchableOpacity
          style={styles.registerButtonWrapper}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.white,
  },
  backButtonWrapper: {
    height: 40,
    width: 40,
    backgroundColor: colors.accent,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    marginVertical: 20,
  },
  headingText: {
    fontSize: 32,
    color: colors.primary,
    fontFamily: fonts.SemiBold,
  },
  formContainer: {
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  registerButtonWrapper: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
  },
  registerText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    padding: 10,
  },
});

export default RegisterScreen;
