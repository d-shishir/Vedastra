import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import * as DocumentPicker from "expo-document-picker";
import axiosInstance from "../../api/axiosInstance";
import { colors } from "../../utils/colors";
import { fonts } from "../../utils/fonts";
import { SafeAreaView } from "react-native-safe-area-context";

const specializationOptions = [
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

const AstrologerRegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [document, setDocument] = useState(null);
  const [secureEntry, setSecureEntry] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleRegister = async () => {
    if (!validateName(name)) {
      return Alert.alert(
        "Error",
        "Please enter a valid name with at least 2 characters."
      );
    }

    if (!validateEmail(email)) {
      return Alert.alert("Error", "Please enter a valid email address.");
    }

    if (
      !name ||
      !email ||
      !password ||
      selectedSpecializations.length === 0 ||
      !document
    ) {
      return Alert.alert(
        "Error",
        "Please fill in all fields and select at least one specialization."
      );
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      selectedSpecializations.forEach((specialization, index) => {
        formData.append(`specializations[${index}]`, specialization);
      });

      if (document) {
        formData.append("document", {
          uri: document.uri,
          type: document.mimeType,
          name: document.name,
        });
      }

      const response = await axiosInstance.post(
        "/astrologers/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Astrologer registered successfully");
      navigation.navigate("AstrologerLogin");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Failed to register astrologer");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: false,
      });

      if (result.canceled) {
        Alert.alert("Info", "Document selection was cancelled");
        return;
      }

      const document = result.assets[0];

      if (document.uri && document.mimeType && document.name) {
        setDocument(document);
      } else {
        Alert.alert("Error", "Document properties are missing");
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", `Failed to pick document: ${error.message}`);
    }
  };

  const toggleSpecialization = (specialization) => {
    setSelectedSpecializations((prevSelected) => {
      if (prevSelected.includes(specialization)) {
        return prevSelected.filter((item) => item !== specialization);
      } else {
        return [...prevSelected, specialization];
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity
        style={styles.backButtonWrapper}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" color={colors.primary} size={25} />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.headingText}>Register as Astrologer</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Name"
            placeholderTextColor={colors.secondary}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Email"
            placeholderTextColor={colors.secondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <SimpleLineIcons name="lock" size={30} color={colors.secondary} />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor={colors.secondary}
            secureTextEntry={secureEntry}
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
        <TouchableOpacity
          style={styles.specializationButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.specializationText}>
            {selectedSpecializations.length > 0
              ? selectedSpecializations.join(", ")
              : "Select Specializations"}
          </Text>
        </TouchableOpacity>
        <Button title="Upload Document" onPress={pickDocument} />
        {document && (
          <Text style={styles.documentInfo}>
            Document: {document.name} ({document.mimeType})
          </Text>
        )}
        <TouchableOpacity
          style={styles.registerButtonWrapper}
          onPress={handleRegister}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={specializationOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedSpecializations.includes(item) &&
                      styles.optionSelected,
                  ]}
                  onPress={() => toggleSpecialization(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedSpecializations.includes(item) &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
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
    textAlign: "center",
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
  documentInfo: {
    marginTop: 8,
    fontSize: 16,
    color: colors.secondary,
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
    paddingVertical: 10,
  },
  specializationButton: {
    borderColor: colors.secondary,
    borderWidth: 1,
    borderRadius: 100,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  specializationText: {
    color: colors.secondary,
    fontSize: 16,
    fontFamily: fonts.Light,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    width: "80%",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  optionSelected: {
    backgroundColor: colors.accent,
  },
  optionText: {
    color: colors.secondary,
    fontSize: 16,
    fontFamily: fonts.Light,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    marginTop: 20,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.SemiBold,
    textAlign: "center",
    paddingVertical: 10,
  },
});

export default AstrologerRegisterScreen;
