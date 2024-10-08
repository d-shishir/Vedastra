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
  Modal,
  KeyboardAvoidingView,
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
const preferencesOptions = [
  "Numerology",
  "Marriage",
  "Daily Horoscope",
  "Personalized Readings",
  "Career",
  "Health",
  "Finance",
  "Family",
  "Relationships",
];

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
  const [preferences, setPreferences] = useState([]);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const validateName = (name) => {
    // Check if the name is not empty and has at least 2 characters
    if (!name || name.trim().length < 2) {
      return false;
    }

    // Check if the name contains only letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name.trim());
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateBirthdate = (birthdate) => {
    const today = new Date();
    const minAge = 0; // Define the minimum age required

    // Check if the birthdate is in the future
    if (birthdate > today) {
      return { isValid: false, message: "Birthdate cannot be in the future." };
    }

    // Calculate the user's age
    const age = today.getFullYear() - birthdate.getFullYear();
    const monthDifference = today.getMonth() - birthdate.getMonth();
    const dayDifference = today.getDate() - birthdate.getDate();

    if (
      age < minAge ||
      (age === minAge &&
        (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))
    ) {
      return {
        isValid: false,
        message: `You must be at least ${minAge} years old.`,
      };
    }

    return { isValid: true };
  };

  const handleRegister = async () => {
    console.log("Selected Preferences:", preferences); // Debug line

    if (!validateName(name)) {
      return Alert.alert(
        "Error",
        "Please enter a valid name with at least 2 characters."
      );
    }

    if (!validateEmail(email)) {
      return Alert.alert("Error", "Please enter a valid email address.");
    }

    const birthdateValidation = validateBirthdate(birthdate);
    if (!birthdateValidation.isValid) {
      return Alert.alert("Error", birthdateValidation.message);
    }

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
        preferences, // Send the selected preferences
        location: selectedLocation,
      });

      await storeToken(response.data.token);

      Alert.alert("Success", "Registered successfully!");
      navigation.navigate("UserTabs");
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

  const handlePreferenceSelect = (preference) => {
    setPreferences((prevPreferences) => {
      if (prevPreferences.includes(preference)) {
        return prevPreferences.filter((item) => item !== preference);
      } else {
        return [...prevPreferences, preference];
      }
    });
  };

  const handlePreferencesSave = () => {
    console.log("Saving Preferences:", preferences); // Debug line
    setShowPreferencesModal(false);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "undefined"}
      style={styles.containerTwo}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // Ensure taps outside text inputs dismiss keyboard
      >
        <TouchableOpacity
          style={styles.backButtonWrapper}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-outline"
            color={colors.primary}
            size={25}
          />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.headingText}>Let's get</Text>
          <Text style={styles.headingText}>started</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={30}
              color={colors.secondary}
            />
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
              <ScrollView>
                {locationResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleLocationSelect(item)}
                  >
                    <Text style={styles.locationItem}>{item.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="list-outline" size={30} color={colors.secondary} />
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => setShowPreferencesModal(true)}
            >
              <Text style={styles.textInputText}>
                {preferences.length > 0
                  ? `Selected Preferences: ${preferences.join(", ")}`
                  : "Select Preferences"}
              </Text>
            </TouchableOpacity>
          </View>
          {showPreferencesModal && (
            <Modal
              transparent
              visible={showPreferencesModal}
              animationType="slide"
              onRequestClose={() => setShowPreferencesModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Preferences</Text>
                  {preferencesOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.preferenceItem}
                      onPress={() => handlePreferenceSelect(option)}
                    >
                      <Text style={styles.preferenceText}>
                        {preferences.includes(option) ? "✓ " : ""}
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handlePreferencesSave}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          <TouchableOpacity
            style={styles.registerButtonWrapper}
            onPress={handleRegister}
          >
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.white,
  },
  containerTwo: {
    flex: 1,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.SemiBold,
    marginBottom: 10,
  },
  preferenceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  preferenceText: {
    fontSize: 16,
    fontFamily: fonts.Light,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
    fontFamily: fonts.SemiBold,
  },
});

export default RegisterScreen;
